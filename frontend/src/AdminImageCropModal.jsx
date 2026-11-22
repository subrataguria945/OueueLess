import { useState, useRef, useEffect, useCallback } from "react";

export function AdminImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  userName = "Admin",
}) {
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);

  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState("circle"); // 'circle' or 'square'
  const [isSaving, setIsSaving] = useState(false);

  const CANVAS_SIZE = 260;
  const CROP_RADIUS = 95; // diameter = 190px
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

    // Clear background
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const img = imgRef.current;
    if (img && isImgLoaded) {
      const baseScale = getBaseScale(img, rotation);
      const totalScale = baseScale * zoom;

      ctx.save();
      // Move to center + pan
      ctx.translate(CENTER + pan.x, CENTER + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(totalScale, totalScale);

      // Draw centered image
      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    // Draw dark overlay mask
    ctx.save();
    ctx.fillStyle = "rgba(10, 15, 30, 0.65)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Punch out the crop viewport
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    if (cropShape === "circle") {
      ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
    } else {
      ctx.rect(CENTER - CROP_RADIUS, CENTER - CROP_RADIUS, CROP_DIAMETER, CROP_DIAMETER);
    }
    ctx.fill();
    ctx.restore();

    // Draw border and subtle grid guide
    ctx.save();
    ctx.beginPath();
    if (cropShape === "circle") {
      ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
    } else {
      ctx.rect(CENTER - CROP_RADIUS, CENTER - CROP_RADIUS, CROP_DIAMETER, CROP_DIAMETER);
    }
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Subtle rule-of-thirds grid
    ctx.save();
    ctx.beginPath();
    if (cropShape === "circle") {
      ctx.arc(CENTER, CENTER, CROP_RADIUS, 0, Math.PI * 2);
    } else {
      ctx.rect(CENTER - CROP_RADIUS, CENTER - CROP_RADIUS, CROP_DIAMETER, CROP_DIAMETER);
    }
    ctx.clip();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const step = CROP_DIAMETER / 3;
    const startX = CENTER - CROP_RADIUS;
    const startY = CENTER - CROP_RADIUS;

    // Vertical lines
    ctx.beginPath();
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

    ctx.restore(); // remove clip
    ctx.restore();
  }, [isImgLoaded, zoom, rotation, pan, cropShape, getBaseScale]);

  // Update live preview thumbnail canvas
  const drawPreview = useCallback(() => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;

    const PREVIEW_SIZE = 64;
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    const img = imgRef.current;
    if (img && isImgLoaded) {
      const baseScale = getBaseScale(img, rotation);
      const totalScale = baseScale * zoom;
      const previewRatio = PREVIEW_SIZE / CROP_DIAMETER;

      ctx.save();
      // Clip preview according to shape
      ctx.beginPath();
      if (cropShape === "circle") {
        ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
      }
      ctx.clip();

      // Transform matching the main canvas crop zone
      ctx.translate(
        PREVIEW_SIZE / 2 + pan.x * previewRatio,
        PREVIEW_SIZE / 2 + pan.y * previewRatio
      );
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(totalScale * previewRatio, totalScale * previewRatio);

      ctx.drawImage(
        img,
        -img.naturalWidth / 2,
        -img.naturalHeight / 2,
        img.naturalWidth,
        img.naturalHeight
      );
      ctx.restore();
    }
  }, [isImgLoaded, zoom, rotation, pan, cropShape, getBaseScale]);

  // Redraw canvases on changes
  useEffect(() => {
    if (isOpen) {
      drawCanvas();
      drawPreview();
    }
  }, [isOpen, drawCanvas, drawPreview]);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3.5));
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset all adjustments
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setCropShape("circle");
  };

  // Generate cropped output image
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img || !isImgLoaded) return;

    setIsSaving(true);
    try {
      const OUTPUT_SIZE = 512; // High-resolution output for sharp rendering
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

      const croppedBase64 = offscreen.toDataURL("image/jpeg", 0.92);
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
    <div className="adm-modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="adm-modal-dialog adm-crop-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="adm-crop-icon-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                <path d="M18 22V8a2 2 0 0 0-2-2H2" />
              </svg>
            </div>
            <div>
              <h3 className="adm-modal-title">Crop & Adjust Profile Picture</h3>
              <p className="adm-modal-subtitle">Drag image to reposition • Slider or mouse wheel to zoom</p>
            </div>
          </div>
          <button
            type="button"
            className="adm-modal-close"
            onClick={onClose}
            title="Cancel & Close"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="adm-modal-body adm-crop-body">
          <div className="adm-crop-studio">
            {/* Left Column: Interactive Canvas Viewport & Zoom Slider */}
            <div className="adm-crop-canvas-col">
              <div className="adm-crop-canvas-frame">
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
                  onWheel={handleWheel}
                  title="Drag to reposition, scroll to zoom"
                />
                <div className="adm-crop-canvas-hint">
                  <span>✋ Drag to Pan</span>
                  <span>•</span>
                  <span>🔍 Wheel to Zoom</span>
                </div>
              </div>

              {/* Zoom Slider Bar right below canvas */}
              <div className="adm-crop-zoom-bar">
                <span className="adm-crop-zoom-label">Zoom</span>
                <button
                  type="button"
                  className="adm-crop-zoom-btn"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                  disabled={zoom <= 1}
                  title="Zoom Out"
                >
                  −
                </button>
                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="adm-crop-range"
                />
                <button
                  type="button"
                  className="adm-crop-zoom-btn"
                  onClick={() => setZoom((prev) => Math.min(3.5, +(prev + 0.1).toFixed(2)))}
                  disabled={zoom >= 3.5}
                  title="Zoom In"
                >
                  +
                </button>
                <span className="adm-crop-zoom-pct">{Math.round(zoom * 100)}%</span>
              </div>
            </div>

            {/* Right Column: Live Avatar Preview & Controls */}
            <div className="adm-crop-controls-col">
              {/* Live Avatar Preview Card */}
              <div className="adm-crop-card">
                <div className="adm-crop-card-label">Live Avatar Preview</div>
                <div className="adm-crop-preview-row">
                  <div className="adm-crop-preview-avatar">
                    <canvas
                      ref={previewCanvasRef}
                      width={64}
                      height={64}
                      className="adm-crop-preview-canvas"
                    />
                  </div>
                  <div className="adm-crop-preview-details">
                    <div className="adm-crop-preview-name">{userName}</div>
                    <div className="adm-crop-preview-role">Admin Profile Display</div>
                    <div className="adm-crop-preview-meta">64×64 Retina Preview</div>
                  </div>
                </div>
              </div>

              {/* Crop Shape Selector */}
              <div className="adm-crop-card">
                <div className="adm-crop-card-label">Crop Viewport Guide</div>
                <div className="adm-crop-shape-pills">
                  <button
                    type="button"
                    className={`adm-crop-shape-pill ${cropShape === "circle" ? "active" : ""}`}
                    onClick={() => setCropShape("circle")}
                  >
                    <span className="shape-icon circle-icon" />
                    <span>Circle (Avatar)</span>
                  </button>
                  <button
                    type="button"
                    className={`adm-crop-shape-pill ${cropShape === "square" ? "active" : ""}`}
                    onClick={() => setCropShape("square")}
                  >
                    <span className="shape-icon square-icon" />
                    <span>Square</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="adm-crop-tools-row">
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary adm-btn-sm adm-crop-tool-btn"
                  onClick={handleRotate}
                  title="Rotate 90 degrees clockwise"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6" />
                    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary adm-btn-sm adm-crop-tool-btn"
                  onClick={handleReset}
                  title="Reset zoom, rotation and position"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Reset Fit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="adm-modal-footer">
          <button
            type="button"
            className="adm-btn adm-btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={handleApplyCrop}
            disabled={isSaving}
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Apply & Save Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
