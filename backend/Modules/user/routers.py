from fastapi import APIRouter , Depends
from .models import UserLogin , RefreshTokenRequest , ForgetPassword, ChangePassword , ResetPassword , VerifyRegistrationOTP , InitiateUserRegister , UserRegisterGoogle,UpdateUserRequest
from Library.Authentication.user.utility import login_user as login , change_password as change_pass, initiate_register , veriy_and_register_user , register_google_user , check_and_send_forget_password_link , reset_password as reset_pass , refresh_user_token, update_user as update_user_service
from Library.Security.gatekeeper import require_active_user
router = APIRouter()

@router.post("/login")
def login_user(data : UserLogin):
    response = login(data.model_dump())
    return response

@router.post("/register/google")
def register_google(data : UserRegisterGoogle):
    response = register_google_user(data.model_dump())
    return response

@router.post("/register/initiate")
def register_initiate(data : InitiateUserRegister):
    response = initiate_register(data.model_dump())
    return response

@router.post("/register/verify")
def register_verify(data : VerifyRegistrationOTP):
    response = veriy_and_register_user(data.model_dump())
    return response

@router.post("/password/change")
def change_password(data : ChangePassword , user_id : int = Depends(require_active_user)):
    payload = data.model_dump()
    payload["userid"] = user_id
    response = change_pass(payload)
    return response

@router.post("/password/forget")
def forget_password(data : ForgetPassword):
    response = check_and_send_forget_password_link(data.model_dump())
    return response
    
@router.post("/password/reset")
def reset_password(data : ResetPassword):
    response = reset_pass(data.model_dump())
    return response

 
@router.post("/refresh")
def generate_new_access_token(data : RefreshTokenRequest):
    response = refresh_user_token(data.model_dump())
    return response

@router.put("/update")
def update_user(data: UpdateUserRequest, user_id: int = Depends(require_active_user)):
    payload = data.model_dump()
    payload["user_id"] = user_id
    response = update_user_service(payload)
    return response
