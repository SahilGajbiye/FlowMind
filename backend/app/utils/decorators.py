from functools import wraps
from flask import request, jsonify
from app.utils.jwt_helper import verify_access_token
from app.models.user import User

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = verify_access_token(token)
        
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        current_user = User.query.get(payload['user_id'])
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 401
        
        return f(current_user=current_user, *args, **kwargs)
    
    return decorated_function
