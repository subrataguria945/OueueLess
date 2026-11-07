from psycopg.rows import dict_row

from Library.Owner.database import get_connection


def get_dashboard_stats():
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT
                    statsid AS stats_id,
                    totalusers AS total_users,
                    totalowners AS total_owners,
                    totalshops AS total_shops,
                    activeusers AS active_users,
                    inactiveusers AS inactive_users,
                    activeowners AS active_owners,
                    inactiveowners AS inactive_owners,
                    activeshops AS active_shops,
                    inactiveshops AS inactive_shops,
                    updatedat AS updated_at
                FROM public.dashboardstats
                WHERE statsid = %s
                """,
                (1,),
            )
            return cur.fetchone()