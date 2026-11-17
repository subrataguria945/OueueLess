import { useState, useRef, useEffect, useCallback } from "react";

export function AdminImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  userName = "Admin",
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // Balanced large crop area that fits comfortably on any screen height
  const CANVAS_SIZE = 320;
  const CROP_RADIUS = 135; // diameter = 270px (fills 85% of viewport, large & clear)
  const CROP_DIAMETER = CROP_RADIUS * 2;
  const CENTER = CANVAS_SIZE / 2;

  // Load the image when imageSrc changes
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setIsImgLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setIsImgLoaded(true);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
    };
    img.onerror = () => {
      alert("Failed to load image for cropping.");
      onClose();
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc, onClose]);

  // Calculate base scale so image covers the crop area
  const getBaseScale = useCallback((img, rot) => {
    if (!img) return 1;
    const isRotated90or270 = rot % 180 !== 0;
    const displayW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
    const displayH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;
    return Math.max(CROP_DIAMETER / displayW, CROP_DIAMETER / displayH);
  }, [CROP_DIAMETER]);

  // Draw on the main interactive canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Clear background
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Draw canvas backing
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const img = imgRef.current;
    if (img && isImgLoaded) {
      const baseScale = getBaseScale(img, rotation);
      const totalScale = baseScale * zoom;

      // Draw image in 100% natural, bright, crisp colors
      ctx.save();
      ctx.translate(CENTER + pan.x, CENTER + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(totalScale, totalScale);

      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();
    }

    // 3. Draw soft dark mask ONLY outside the circle using even-odd fill rule
    // (Inside of the circle is 100% untouched, bright, sharp and natural!)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15, 23, 42, 0.52)";
    ctx.fill("evenodd");
    ctx.restore();

    // 4. Subtle rule-of-thirds grid lines ONLY while dragging
    if (isDragging) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
      ctx.clip();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      const step = CROP_DIAMETER / 3;
      const startX = CENTER - CROP_RADIUS;
      const startY = CENTER - CROP_RADIUS;

      ctx.beginPath();
      // Vertical lines
      ctx.moveTo(startX + step, startY);
      ctx.lineTo(startX + step, startY + CROP_DIAMETER);
      ctx.moveTo(startX + step * 2, startY);
      ctx.lineTo(startX + step * 2, startY + CROP_DIAMETER);
      // Horizontal lines
      ctx.moveTo(startX, startY + step);
      ctx.lineTo(startX + CROP_DIAMETER, startY + step);
      ctx.moveTo(startX, startY + step * 2);
      ctx.lineTo(startX + CROP_DIAMETER, startY + step * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Crisp white circular crop ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }, [isImgLoaded, zoom, rotation, pan, isDragging, getBaseScale]);

  // Redraw canvas on changes
  useEffect(() => {
    if (isOpen) {
      drawCanvas();
    }
  }, [isOpen, drawCanvas]);

  // Attach non-passive wheel listener for smooth zoom without browser warnings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelZoom = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5));
    };

    canvas.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheelZoom);
  }, []);

  // Compute scale factor if canvas is scaled responsively on smaller screens
  const getScaleFactor = () => {
    if (!canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    return rect.width > 0 ? CANVAS_SIZE / rect.width : 1;
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const factor = getScaleFactor();
    setDragStart({
      x: e.clientX * factor - pan.x,
      y: e.clientY * factor - pan.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const factor = getScaleFactor();
    setPan({
      x: e.clientX * factor - dragStart.x,
      y: e.clientY * factor - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setIsDragging(true);
      const factor = getScaleFactor();
      setDragStart({
        x: e.touches[0].clientX * factor - pan.x,
        y: e.touches[0].clientY * factor - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || e.touches.length !== 1) return;
    const factor = getScaleFactor();
    setPan({
      x: e.touches[0].clientX * factor - dragStart.x,
      y: e.touches[0].clientY * factor - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Generate cropped output image
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !isImgLoaded) return;

    setIsSaving(true);
    try {
      const OUTPUT_SIZE = 512;
      const offscreen = document.createElement("canvas");
      offscreen.width = OUTPUT_SIZE;
      offscreen.height = OUTPUT_SIZE;
      const ctx = offscreen.getContext("2d");

      const baseScale = getBaseScale(img, rotation);
      const totalScale = baseScale * zoom;
      const scaleMultiplier = OUTPUT_SIZE / CROP_DIAMETER;

      // Draw image transformed to match the crop zone
      ctx.save();
      ctx.translate(
        OUTPUT_SIZE / 2 + pan.x * scaleMultiplier,
        OUTPUT_SIZE / 2 + pan.y * scaleMultiplier
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(totalScale * scaleMultiplier, totalScale * scaleMultiplier);

      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();

      const croppedBase64 = offscreen.toDataURL("image/jpeg", 0.94);
      onCropComplete(croppedBase64);
    } catch (err) {
      console.error("Crop error:", err);
      alert("Failed to crop image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="adm-modal-backdrop adm-crop-backdrop"
      onClick={onClose}
      style={{
        zIndex: 10000,
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <div
        className="adm-modal-dialog adm-crop-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          cursor: "default",
          caretColor: "transparent",
        }}
      >
        {/* Clean Modal Header */}
        <div className="adm-crop-header">
          <div className="adm-crop-header-left">
            <div className="adm-crop-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                <path d="M18 22V8a2 2 0 0 0-2-2H2" />
              </svg>
            </div>
            <div>
              <h3 className="adm-crop-title">Crop Profile Picture</h3>
              <p className="adm-crop-subtitle">Drag image to position • Scroll or slider to zoom</p>
            </div>
          </div>

          <button
            type="button"
            className="adm-crop-close-btn"
            onClick={onClose}
            title="Cancel & Close"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body: Large Viewport, Clean Zoom & Actions */}
        <div className="adm-crop-body">
          {/* Crop Viewport */}
          <div className="adm-crop-viewport">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className={`adm-crop-canvas ${isDragging ? "dragging" : ""}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              title="Drag to reposition, scroll to zoom"
            />
          </div>

          {/* Clean Zoom Slider */}
          <div className="adm-crop-zoom-bar">
            <button
              type="button"
              className="adm-crop-zoom-btn"
              onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
              disabled={zoom <= 1}
              title="Zoom Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <div className="adm-crop-range-wrap">
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="adm-crop-range-input"
                aria-label="Zoom scale"
              />
            </div>

            <button
              type="button"
              className="adm-crop-zoom-btn"
              onClick={() => setZoom((prev) => Math.min(3.5, +(prev + 0.1).toFixed(2)))}
              disabled={zoom >= 3.5}
              title="Zoom In"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <span className="adm-crop-zoom-pct">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Simple Secondary Actions: Rotate & Reset */}
          <div className="adm-crop-actions-bar">
            <button
              type="button"
              className="adm-crop-action-btn"
              onClick={handleRotate}
              title="Rotate 90 degrees clockwise"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6" />
                <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              className="adm-crop-action-btn"
              onClick={handleReset}
              title="Reset zoom and position"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Clean Modal Footer - Always Anchored & Fully Visible */}
        <div className="adm-crop-footer">
          <button
            type="button"
            className="adm-crop-btn-cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="adm-crop-btn-save"
            onClick={handleApplyCrop}
            disabled={isSaving}
          >
            {isSaving ? (
              <span>Saving Photo...</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
