from pydantic import BaseModel , EmailStr 


class AddOwnerRequest(BaseModel):
    admin_user_id: int
    fullname: str
    email: EmailStr
    password: str
    phone: str
    max_shop_count: int
    backup_id:int