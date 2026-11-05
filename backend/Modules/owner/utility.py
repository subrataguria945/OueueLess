from .database import insert_owner_indb

def register_owner(input: dict):
    admin_user_id = input.get("admin_user_id")
    fullname = input.get("fullname")
    email = input.get("email")
    password = input.get("password")
    phone = input.get("phone")
    max_shop_count = input.get("max_shop_count")
    backup_id = input.get("backup_id")

    response = insert_owner_indb(admin_user_id, fullname, email, password, phone, max_shop_count, backup_id)
    if response.get("status") == 200:
        return {
            "status" : "success",
            "new_owner_id": response.get("new_owner_id"),
            "new_user_id": response.get("new_user_id"),
            "message": response.get("message")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }
