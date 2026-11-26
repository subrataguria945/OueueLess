from .database import create_shop_for_owner, update_shop_for_owner, delete_shop_for_owner,get_active_shops_by_pincode

# Utility functions for create shop operations for a specific owner
def create_shop(user_id: int, data: dict):
    return create_shop_for_owner(user_id, data)


def update_shop(user_id: int, shop_id: int, data: dict):
    return update_shop_for_owner(user_id, shop_id, data)


def delete_shop(user_id: int, shop_id: int):
    return delete_shop_for_owner(user_id, shop_id)


def get_active_shops(pincode: str):
    return get_active_shops_by_pincode(pincode)
