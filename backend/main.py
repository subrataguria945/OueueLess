from dotenv import load_dotenv
from Modules.user.routers import router as user_router

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


app.include_router(user_router, prefix="/user",tags=["Users"])