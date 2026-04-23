import jwt
from datetime import datetime, timedelta, timezone
from flask import current_app
from functools import wraps

def generate_tokens(user_id):
    access_token_payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.now(timezone.utc),
        'type': 'access'
    }
    
    refresh_token_payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + current_app.config['JWT_REFRESH_TOKEN_EXPIRES'],
        'iat': datetime.now(timezone.utc),
        'type': 'refresh'
    }
    
    access_token = jwt.encode(
        access_token_payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    refresh_token = jwt.encode(
        refresh_token_payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )
    
    return access_token, refresh_token


def verify_access_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        
        if payload.get('type') != 'access':
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def verify_refresh_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256']
        )
        
        if payload.get('type') != 'refresh':
            return None
            
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
