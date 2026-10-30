from datetime import datetime, timedelta , timezone
import jwt
import os 
from dotenv import load_dotenv
load_dotenv()

def generate_access_token(user_id , email):
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

def generate_signup_token(user_data : dict , otp_hash : str):
    payload = {
        "user_data" : user_data,
        "otp_hash" : otp_hash,
        "exp" : datetime.now(timezone.utc) + timedelta(minutes=5),
        "iat" : datetime.now(timezone.utc)
    }
    token = jwt.encode(payload , 
                        key= os.getenv("JWT_SECRET_KEY"),
                        algorithm="HS256"
                        )
    return token

def decode_token(token : str):
    if not token:
        return {"error": "Token is required."}
    try:
        return jwt.decode(token, key=os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired. Please try again."}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token."}
