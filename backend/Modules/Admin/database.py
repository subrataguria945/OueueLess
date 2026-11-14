from .models import ShopDetails
import psycopg
from psycopg.rows import dict_row
import os 

def get_connection():
    return psycopg.connect(
        host=os.getenv("HOST"),
        dbname=os.getenv("DATABASE"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", "5432"),
    )


def get_all_shop_details(admin_id):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM public.sp_get_all_shops_details(%s)", (admin_id,))
            return cur.fetchall()

# Fetch all users for admin view via sp_get_all_user_details
def get_all_users_details(admin_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT public.sp_get_all_user_details(%s)", (admin_id,))
            row = cur.fetchone()
            return row[0] if row else {"owners": [], "users": []}

# Fetch all owners and their shop details for admin
def get_all_owners_details(admin_id):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM public.sp_get_all_owners_details(%s)", (admin_id,))
            return cur.fetchall()