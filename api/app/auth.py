from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import os
import requests
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else None

# Algorithms
ALGORITHM = "RS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_jwks():
    if not JWKS_URL:
        return None
    try:
        response = requests.get(JWKS_URL)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Mock user for development if no Supabase URL is set
    is_mock_mode = not SUPABASE_URL or "supabase.co" not in SUPABASE_URL
    
    if is_mock_mode and not token:
        return {"user_id": "mock-user-123", "email": "mock@example.com"}

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        # Fetch public keys from Supabase
        jwks = get_jwks()
        if not jwks:
            # Fallback for dev if JWKS fails but we want things to work
            if is_mock_mode:
                return {"user_id": "mock-user-123", "email": "mock@example.com"}
            raise HTTPException(status_code=500, detail="Could not fetch auth keys from Supabase")

        # Decode without verification first to get the key ID (kid)
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            raise credentials_exception

        # Find the matching key in JWKS
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key:
            raise credentials_exception

        # Decode and verify using the public key
        payload = jwt.decode(
            token, 
            key, 
            algorithms=[ALGORITHM], 
            options={"verify_aud": False}
        )
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise credentials_exception
            
        return {"user_id": user_id, "email": email}
        
    except Exception as e:
        print(f"Auth error: {e}")
        # Fallback to mock user if we are in dev/mock mode
        if is_mock_mode:
             return {"user_id": "mock-user-123", "email": "mock@example.com"}
        raise credentials_exception

