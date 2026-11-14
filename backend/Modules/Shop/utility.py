from .database import create_shop_for_owner, update_shop_for_owner, delete_shop_for_owner

# Utility functions for create shop operations for a specific owner
def create_shop(user_id: int, data: dict):
    return create_shop_for_owner(user_id, data)


# Utility function to update shop details for a specific owner
def update_shop(user_id: int, shop_id: int, data: dict):
    return update_shop_for_owner(user_id, shop_id, data)

# Utility function to delete shop details for a specific owner
def delete_shop(user_id: int, shop_id: int):
    return delete_shop_for_owner(user_id, shop_id)