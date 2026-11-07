from datetime import datetime
from pydantic import BaseModel


class DashboardStats(BaseModel):
    stats_id: int
    total_users: int
    total_owners: int
    total_shops: int
    active_users: int
    inactive_users: int
    active_owners: int
    inactive_owners: int
    active_shops: int
    inactive_shops: int
    updated_at: datetime