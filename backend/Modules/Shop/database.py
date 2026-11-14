from Modules.owner.database import get_connection

#create shop for owner
def create_shop_for_owner(user_id: int, data: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Authenticated user-এর owner ID বের করো
            cur.execute(
                """
                SELECT ownerid
                FROM public.users
                WHERE userid = %s
                  AND roleid = 2
                  AND status = TRUE
                """,
                (user_id,),
            )
            user = cur.fetchone()

            if user is None or user[0] is None:
                return None

            owner_id = user[0]

            # Procedure-এর IN parameter order:
            # owner_id, user_id, shop_name, description, address, city,
            # state, pincode, phone, email, shop_image, opening_time, closing_time
            cur.execute(
                """
                CALL public.sp_create_shop(
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    NULL, NULL, NULL
                )
                """,
                (
                    owner_id,
                    user_id,
                    data["shop_name"],
                    data["description"],
                    data["address"],
                    data["city"],
                    data["state"],
                    data["pincode"],
                    data["phone"],
                    data["email"],
                    data["shop_image"],
                    data["opening_time"],
                    data["closing_time"],
                ),
            )

            result = cur.fetchone()
            if result is None:
                raise RuntimeError("sp_create_shop returned no result")

            shop_id, status_code, status_message = result

            return {
                "shop_id": shop_id,
                "status_code": status_code,
                "message": status_message,
            }

#Update shop for owner
def update_shop_for_owner(user_id: int, shop_id: int, data: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ownerid
                FROM public.users
                WHERE userid = %s
                  AND roleid = 2
                  AND status = TRUE
                """,
                (user_id,),
            )
            user = cur.fetchone()

            if user is None or user[0] is None:
                return None

            owner_id = user[0]

            cur.execute(
                """
                CALL public.sp_update_shop(
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    NULL, NULL
                )
                """,
                (
                    shop_id,
                    owner_id,
                    user_id,
                    data["shop_name"],
                    data["description"],
                    data["address"],
                    data["city"],
                    data["state"],
                    data["pincode"],
                    data["phone"],
                    data["email"],
                    data["shop_image"],
                    data["opening_time"],
                    data["closing_time"],
                ),
            )

            result = cur.fetchone()
            if result is None:
                raise RuntimeError("sp_update_shop returned no result")

            status_code, status_message = result

            return {
                "status_code": status_code,
                "message": status_message,
            }