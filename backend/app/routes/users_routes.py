from flask import Blueprint, request
from app.controllers.user_controller import UserController

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    return UserController.get_all_users()

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return UserController.get_user(user_id)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return UserController.register_user(data)

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return UserController.login_user(data)

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()
    return UserController.update_user(user_id, data)

@user_bp.route('/<int:user_id>/change-password', methods=['PUT'])
def change_password(user_id):
    data = request.get_json()
    return UserController.change_password(user_id, data)

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    return UserController.delete_user(user_id)
