from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OperatingDay(BaseModel):
    model_config = ConfigDict(extra="forbid")

    open: str | None = Field(
        default=None,
        pattern=r"^([01][0-9]|2[0-3]):[0-5][0-9]$",
    )
    close: str | None = Field(
        default=None,
        pattern=r"^([01][0-9]|2[0-3]):[0-5][0-9]$",
    )
    is_closed: bool


class OperatingHours(BaseModel):
    model_config = ConfigDict(extra="forbid")

    monday: OperatingDay
    tuesday: OperatingDay
    wednesday: OperatingDay
    thursday: OperatingDay
    friday: OperatingDay
    saturday: OperatingDay
    sunday: OperatingDay


class CreateShopRequest(BaseModel):
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str | None = None
    pincode: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    shop_image: str | None = None
    max_daily_tokens: int | None = Field(default=None, gt=0)
    is_queue_open: bool
    operating_hours: OperatingHours | None = None


class UpdateShopRequest(BaseModel):
    shop_id: int
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str | None = None
    pincode: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    shop_image: str | None = None
    max_daily_tokens: int | None = Field(default=None, gt=0)
    is_queue_open: bool | None = None
    operating_hours: OperatingHours | None = None

#Shop details model
class ShopDetail(BaseModel):
    shop_id: int
    owner_id: int
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str | None = None
    pincode: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    shop_image: str | None = None
    max_daily_tokens: int | None = Field(default=None, gt=0)
    is_queue_open: bool | None = None
    operating_hours: OperatingHours | None = None


class DeleteShopRequest(BaseModel):
    shop_id: int


class ActiveShop(BaseModel):
    shop_id: int
    shop_name: str
    description: str | None = None
    address: str
    city: str
    state: str | None = None
    pincode: str
    phone: str | None = None
    email: str | None = None
    shop_image: str | None = None
    is_active: bool
    is_queue_open: bool
    max_daily_tokens: int | None = None
    operating_hours: dict | None = None