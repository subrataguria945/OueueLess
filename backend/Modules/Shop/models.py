from datetime import time , datetime
from pydantic import BaseModel,EmailStr

#Create new shop request model
class CreateShopRequest(BaseModel):
    shop_name:str
    description:str | None=None
    address:str  
    city:str
    state:str
    pincode:str
    phone:str
    email:EmailStr |None=None
    shop_image:str | None=None
    opening_time:time   |None=None
    closing_time:time   |None=None


#Update shop request model
class UpdateShopRequest(BaseModel):
    shop_id: int
    shop_name: str  | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    phone: str  | None = None
    email: EmailStr | None = None
    shop_image: str | None = None
    opening_time: time | None = None
    closing_time: time | None = None

#Shop details model
class ShopDetail(BaseModel):
    shop_id: int
    owner_id: int
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str
    pincode: str
    phone: str
    email: str | None = None
    is_active: bool
    shop_image: str | None = None
    opening_time: time | None = None
    closing_time: time | None = None
    created_at: datetime | None = None

#Delete shop request model
class DeleteShopRequest(BaseModel):
    shop_id: int

