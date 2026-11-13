from datetime import time
from pydantic import BaseModel,EmailStr

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
