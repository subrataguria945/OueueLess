from datetime import datetime
from pydantic import BaseModel, EmailStr

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

# Response schema for listing owners
class OwnerDetail(BaseModel):
    user_id: int
    owner_id: int
    full_name: str
    profile_image: str | None = None
    email: str
    phone: str | None = None
    address : str | None = None
    shop_count: int
    max_shop_count: int
    account_status: bool
    joined_date: datetime

# Request schema for toggling owner active/inactive status
class UpdateOwnerStatusRequest(BaseModel):
    owner_id: int   
    new_status: bool

# Request schema for owner deletion
class DeleteOwnerRequest(BaseModel):
    user_id : int
    owner_id: int
