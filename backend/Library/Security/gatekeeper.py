from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from Library.Owner.database import get_user_role_and_status
from Library.Security.JWT import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> int:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required.",
        )

    payload = decode_access_token(credentials.credentials)

    if "error" in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=payload["error"],
        )

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
        )

    user = get_user_role_and_status(user_id)

    if user is None or user[1] is not True:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active account required.",
        )

    if user[0] != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return user_id



def require_active_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> int:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Bearer token required.")

    payload = decode_access_token(credentials.credentials)
    if "error" in payload:
        raise HTTPException(status_code=401, detail=payload["error"])

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token.")

    return user_id

