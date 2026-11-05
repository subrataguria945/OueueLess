from datetime import datetime
from pydantic import BaseModel


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