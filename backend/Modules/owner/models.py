from datetime import datetime
from pydantic import BaseModel, EmailStr

class AddOwnerRequest(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    phone: str
    max_shop_count: int
    backup_id: int

class OwnerDetail(BaseModel):
    owner_id: int
    full_name: str
    profile_image: str | None = None
    email: str
    phone: str | None = None
    shop_count: int
    max_shop_count: int
    account_status: bool
    joined_date: datetime
    shop_details: str

class UpdateOwnerStatusRequest(BaseModel):
    owner_id: int   
    new_status: bool