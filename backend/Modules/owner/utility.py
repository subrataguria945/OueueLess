from .database import delete_owner_indb, get_shops_details_from_db






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
 

def get_shop_details(owner_id: int, user_id: int):
    return get_shops_details_from_db(owner_id, user_id)
  
