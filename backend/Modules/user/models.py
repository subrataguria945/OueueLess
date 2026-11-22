from pydantic import BaseModel

class UpdateUserRequest(BaseModel):
    fullname : str | None = None
    phone : str | None = None
    profile_image : str | None = None    
    address : str | None = None

class JoinQueueRequest(BaseModel):
    shop_id : int
    service_id : int
