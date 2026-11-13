from .database import create_shop_for_owner


def create_shop(user_id: int, data: dict):
    return create_shop_for_owner(user_id, data)