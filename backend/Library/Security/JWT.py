from datetime import datetime, timedelta , timezone
import jwt
import os 
from dotenv import load_dotenv

load_dotenv()

def generate_jwt_token(user_id , email):
    payload ={
        "user_id" : user_id,
        "email" : email,
        # token expiry time 
        "exp" : datetime.now(timezone.utc) + timedelta(minutes=30),
        # token creation time 
        "iat" : datetime.now(timezone.utc)
    }

    token = jwt.encode(payload , 
                        key= os.getenv("JWT_SECRET_KEY"),
                        algorithm="HS256"
                        )
    return token