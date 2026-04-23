from flask import Blueprint, request
from app.controllers.auth_controller import AuthController
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return AuthController.register(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthController.login(data)

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    data = request.get_json()
    return AuthController.refresh(data)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    data = request.get_json()
    return AuthController.logout(data)

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    return AuthController.get_profile(current_user)
