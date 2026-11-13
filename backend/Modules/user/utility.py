from .database import update_user_indb

# Process user profile update
def update_user(input:dict):
    user_id = input.get("user_id")
    fullname = input.get("fullname")
    phone = input.get("phone")
    profile_image = input.get("profile_image")
    address = input.get("address")
    response = update_user_indb(user_id, fullname, phone, profile_image,address)
    if response.get("status") == 200:
        return {
            "status": "success",
            "message": response.get("message")
        }
    else:
        return {
            "status": "failed",
            "message": response.get("error")
        }

