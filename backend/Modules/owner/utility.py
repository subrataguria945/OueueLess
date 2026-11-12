from .database import insert_owner_indb, update_owner_status_indb , delete_owner_indb
from Library.Notification.email import send_owner_invite_email
from Library.Security.JWT import generate_owner_invite_token

def register_owner(input: dict):
    admin_id = input.get("admin_id")
    fullname = input.get("fullname")
    email = input.get("email")
    password = input.get("password")
    phone = input.get("phone")
    address = input.get("address")
    max_shop_count = input.get("max_shop_count")
    backup_id = input.get("backup_id")

    response = insert_owner_indb(admin_id, fullname, email, password, phone,address, max_shop_count, backup_id)
    if response.get("status") == 200:
        new_user_id = response.get("new_user_id")
        invite_token = generate_owner_invite_token(email, new_user_id)
        send_owner_invite_email(fullname, email, invite_token)
        return {
            "status" : "success",
            "owner_id": response.get("new_owner_id"),
            "user_id": new_user_id,
            "message": "Owner registered successfully. Invitation link sent to their email."
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }

def update_owner_status(input: dict):
    admin_id = input.get("admin_id")
    owner_id = input.get("owner_id")
    new_status = input.get("new_status")

    response = update_owner_status_indb(admin_id, owner_id, new_status)
    if response.get("status") == 200:
        return {
            "status" : "success",
            "message": response.get("message")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }

def delete_owner(input:dict):
    admin_id = input.get("admin_user_id")
    owner_id = input.get("owner_id")

    response = delete_owner_indb(admin_id, owner_id)
    if response.get("status") == 200:
        return {
            "status" : "success",
            "message": response.get("message")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }  