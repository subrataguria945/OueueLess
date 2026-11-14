from fastapi import APIRouter, Depends, HTTPException, status

from .database import get_dashboard_stats
from Library.Security.gatekeeper import require_admin
from .models import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def read_dashboard_stats(_: int = Depends(require_admin)):
    stats = get_dashboard_stats()

    if stats is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard stats not found.",
        )

    return stats