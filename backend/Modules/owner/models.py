from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Any
# Request schema for registering a new owner
class AddOwnerRequest(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    phone: str | None = None
    address : str | None = None
    max_shop_count: int
    backup_id: int

# Request schema for updating owner profile
class UpdateOwner(BaseModel):
    owner_id: int   
    fullname: str
    email: EmailStr
    phone: str | None = None
    address : str | None = None
    max_shop_count: int
    backup_id: int



# Request schema for toggling owner active/inactive status
class UpdateOwnerStatusRequest(BaseModel):
    owner_id: int   
    new_status: bool

# Request schema for owner deletion
class DeleteOwnerRequest(BaseModel):
    user_id : int
    owner_id: int

class GetShops(BaseModel):
    owner_id : int

class ShopDetails(BaseModel):
    shop_id: int
    owner_id: int
    owner_user_id: int
    owner_name: str
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None
    shop_image: str | None = None
    is_queue_open: bool | None = None
    max_daily_tokens: int | None = None
    operating_hours: dict[str, Any] | None = None