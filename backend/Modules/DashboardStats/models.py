from datetime import datetime
from pydantic import BaseModel


class DashboardStats(BaseModel):
    stats_id: int
    total_customers: int
    active_customers: int
    inactive_customers: int
    total_owners: int
    active_owners: int
    inactive_owners: int
    total_shops: int
    active_shops: int
    inactive_shops: int
    updated_at: datetime