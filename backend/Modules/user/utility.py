from .database import update_user_indb, join_queue_indb, get_shop_by_id_indb

# Process user profile update
def update_user(input:dict):
    user_id = input.get("user_id")
    fullname = input.get("fullname")
    phone = input.get("phone")
    profile_image = input.get("profile_image")
    address = input.get("address")
    response = update_user_indb(user_id, fullname, phone, profile_image, address)
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

# Process customer join queue request
def join_queue(input: dict):
    user_id = input.get("user_id")
    shop_id = input.get("shop_id")
    service_id = input.get("service_id")

    response = join_queue_indb(
        user_id,
        shop_id,
        service_id
    )

    if response.get("status") == 200:
        return {
            "status": "success",
            "message": response.get("message"),
            "data": {
                "token_id": response.get("token_id"),
                "token_number": response.get("token_number"),
                "queue_position": response.get("queue_position"),
                "estimated_wait_minutes": response.get("estimated_wait_minutes")
            }
        }

    return {
        "status": "failed",
        "error": response.get("error"),
        "message": response.get("message")
    }

# Retrieve shop details by shop_id
def get_shop_by_id(shop_id: int):
    return get_shop_by_id_indb(shop_id)
