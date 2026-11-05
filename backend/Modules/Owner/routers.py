from fastapi import APIRouter, Depends

from Library.Owner.database import get_all_owners_details
from Library.Security.dependencies import require_admin
from .models import OwnerDetail

router = APIRouter()


@router.get("/owners", response_model=list[OwnerDetail])
def list_owners(_: int = Depends(require_admin)):
    return get_all_owners_details()