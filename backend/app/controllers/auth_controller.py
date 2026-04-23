from app import db
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.jwt_helper import generate_tokens, verify_refresh_token
from flask import jsonify, current_app
from datetime import datetime, timezone

class AuthController:
    
    @staticmethod
    def register(data):
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 409
        
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token, refresh_token = generate_tokens(user.id)
        
        refresh_token_entry = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        )
        db.session.add(refresh_token_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    
    @staticmethod
    def login(data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing credentials'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token, refresh_token = generate_tokens(user.id)
        
        refresh_token_entry = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=datetime.now(timezone.utc) + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        )
        db.session.add(refresh_token_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
    
    @staticmethod
    def refresh(data):
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        payload = verify_refresh_token(refresh_token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired refresh token'}), 401
        
        token_entry = RefreshToken.query.filter_by(token=refresh_token).first()
        
        if not token_entry or not token_entry.is_valid():
            return jsonify({'error': 'Invalid or revoked refresh token'}), 401
        
        user = User.query.get(payload['user_id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        access_token, new_refresh_token = generate_tokens(user.id)
        
        token_entry.revoked = True
        db.session.commit()
        
        new_refresh_token_entry = RefreshToken(
            user_id=user.id,
            token=new_refresh_token,
            expires_at=datetime.now(timezone.utc) + current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        )
        db.session.add(new_refresh_token_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'access_token': access_token,
            'refresh_token': new_refresh_token
        }), 200
    
    @staticmethod
    def logout(data):
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token is required'}), 400
        
        token_entry = RefreshToken.query.filter_by(token=refresh_token).first()
        
        if token_entry:
            token_entry.revoked = True
            db.session.commit()
        
        return jsonify({'message': 'Logout successful'}), 200
    
    @staticmethod
    def get_profile(current_user):
        return jsonify(current_user.to_dict()), 200
