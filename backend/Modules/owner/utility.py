from .database import delete_owner_indb, insert_owner_indb, update_owner_status_indb , update_owner_indb
from Library.Notification.email import send_owner_invite_email
from Library.Security.JWT import generate_owner_invite_token

# Register owner in database and send email invitation token
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
        invite_token = generate_owner_invite_token(email, response.get("data").get("user_id"))
        send_owner_invite_email(fullname, email, invite_token)
        return {
            "status" : "success",
            "message": response.get("message"),
            "data": response.get("data")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }

# Update owner active/inactive status
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

# Delete owner from database
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

# Update owner profile and business limits
def update_owner(input:dict):
    admin_id = input.get("admin_id")
    owner_id = input.get("owner_id")
    fullname = input.get("fullname")
    email = input.get("email")
    phone = input.get("phone")
    address = input.get("address")
    max_shop_count = input.get("max_shop_count")
    backup_id = input.get("backup_id")

    response = update_owner_indb(admin_id ,owner_id, fullname, email, phone, address, max_shop_count, backup_id)
    if response.get("status") == 200:
        return {
            "status" : "success",
            "message": response.get("message"),
            "data": response.get("data")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }  