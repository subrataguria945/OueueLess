from Modules.owner.database import get_connection
from psycopg.types.json import Jsonb

#create shop for owner
def create_shop_for_owner(user_id: int, data: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            # Authenticated user-এর owner ID বের করো
            cur.execute(
                """
                SELECT o.ownerid
                FROM public.owners o
                JOIN public.users u ON u.userid = o.userid
                WHERE u.userid = %s
                  AND u.roleid = 2
                  AND u.status = TRUE
                """,
                (user_id,),
            )
            user = cur.fetchone()

            if user is None or user[0] is None:
                return None

            owner_id = user[0]

            operating_hours = data["operating_hours"]
            cur.execute(
                """
                CALL public.sp_create_shop(
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
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
                    data["max_daily_tokens"],
                    data["is_queue_open"],
                    Jsonb(operating_hours) if operating_hours is not None else None,
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


def update_shop_for_owner(user_id: int, shop_id: int, data: dict):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT o.ownerid
                FROM public.owners o
                JOIN public.users u ON u.userid = o.userid
                WHERE u.userid = %s
                  AND u.roleid = 2
                  AND u.status = TRUE
                """,
                (user_id,),
            )
            user = cur.fetchone()

            if user is None:
                return None

            owner_id = user[0]
            hours = data["operating_hours"]

            cur.execute(
                """
                CALL public.sp_update_shop(
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s,
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
                    data["max_daily_tokens"],
                    data["is_queue_open"],
                    Jsonb(hours) if hours is not None else None,
                ),
            )

            result = cur.fetchone()
            if result is None:
                raise RuntimeError("sp_update_shop returned no result")

            status_code, status_message = result
            return {"status_code": status_code, "message": status_message}


def delete_shop_for_owner(user_id: int, shop_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT o.ownerid
                FROM public.owners o
                JOIN public.users u ON u.userid = o.userid
                WHERE u.userid = %s
                  AND u.roleid = 2
                  AND u.status = TRUE
                """,
                (user_id,),
            )
            user = cur.fetchone()

            if user is None:
                return None

            cur.execute(
                """
                CALL public.sp_delete_shop(%s, %s, %s, NULL, NULL)
                """,
                (shop_id, user[0], user_id),
            )

            result = cur.fetchone()
            if result is None:
                raise RuntimeError("sp_delete_shop returned no result")

            status_code, status_message = result
            return {"status_code": status_code, "message": status_message}