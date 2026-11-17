from datetime import datetime
from typing import Any 

from pydantic import BaseModel , EmailStr


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

# class UserDetail(BaseModel):
#     user_id: int
#     role :  str
#     full_name: str
#     profile_image: str | None = None
#     email: str
#     phone: str | None = None
#     address : str | None = None
#     email_verified : bool
#     account_status: bool
#     joined_date: datetime

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
    shop_details: str | None = None


class OwnerDetailsForUser(BaseModel):
    ownerid: int
    maxshopcount: int
    backupid: int | None = None
    createdbyuserid: int | None = None
    userid: int


class UserDetailsForUser(BaseModel):
    userid: int
    fullname: str
    email: str
    phone: str | None = None
    googleid: str | None = None
    profileimage: str | None = None
    isemailverified: bool
    status: bool
    createdat: datetime
    updatedat: datetime | None = None
    roleid: int | None = None
    address: str | None = None


class AllUserDetailsResponse(BaseModel):
    owners: list[OwnerDetailsForUser]
    users: list[UserDetailsForUser]

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

class UpdateUser(BaseModel):
    user_id: int   
    fullname: str
    email: EmailStr
    phone: str | None = None
    address : str | None = None

# Request schema for toggling owner active/inactive status
class UpdateOwnerStatusRequest(BaseModel):
    owner_id: int   
    new_status: bool

class UpdateUserStatusRequest(BaseModel):
    user_id: int   
    new_status: bool
    