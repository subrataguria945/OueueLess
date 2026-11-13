from dotenv import load_dotenv
from Modules.user.routers import router as user_router
from Modules.owner.routers import router as owner_router
from Modules.DashboardStats.routers import router as dashboard_router
from Modules.Shop.routers import router as shop_router

load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Welcome to the QueueLess Backend API"}

# User routes
app.include_router(user_router, prefix="/user", tags=["Users"])

# Owner routes
app.include_router(owner_router, prefix="/owner", tags=["Owner"])

# Dashboard routes
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
# Shop routes
app.include_router(shop_router, prefix="/shop", tags=["Shop"])