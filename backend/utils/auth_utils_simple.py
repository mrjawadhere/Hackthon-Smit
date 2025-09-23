from fastapi import Depends,HTTPException
from fastapi.security import OAuth2PasswordBearer,APIKeyHeader
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
import base64
import json


SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
API_KEY_NAME = "x-api-key"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a simple base64 encoded token for demo purposes"""
    try: 
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire.isoformat()})
        
        # Simple base64 encoding for demo (not secure for production)
        token_string = json.dumps(to_encode)
        token_bytes = token_string.encode('utf-8')
        return base64.b64encode(token_bytes).decode('utf-8')
    except Exception as e:
        print('An exception occurred creating token:', e)
        return None

def verify_access_token(token: str):
    """Verify simple base64 token"""
    try:
        token_bytes = base64.b64decode(token.encode('utf-8'))
        token_string = token_bytes.decode('utf-8')
        payload = json.loads(token_string)
        
        # Check expiration
        exp = datetime.fromisoformat(payload.get('exp'))
        if datetime.utcnow() > exp:
            print('Token expired')
            return None
            
        return payload
    except Exception as e:
        print('Token verification error:', e)
        return None    

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        decoded_token = verify_access_token(token)
        if decoded_token:
            return decoded_token
        else:
            raise HTTPException(status_code=401, detail="Token not parseable")
    except Exception as e:
        print('Token verification exception:', e)
        raise HTTPException(status_code=401, detail="Invalid token")
    

def verify_api_key(api_key_header: str = Depends(api_key_header)):
    try:
        expected_key = os.getenv("API_KEY", "your-api-key-here")
        if api_key_header == expected_key:
            return api_key_header
        else:
            raise HTTPException(status_code=401, detail="Invalid API Key")
    except Exception as e:
      print('API key verification error:', e)
      raise HTTPException(status_code=401, detail="Invalid API Key")