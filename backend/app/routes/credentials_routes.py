from flask import Blueprint, request
from app.controllers.credentials_controller import CredentialsController
from app.utils.decorators import token_required

credentials_bp = Blueprint('credentials', __name__)

@credentials_bp.route('/users/<int:user_id>/credentials', methods=['GET'])
@token_required
def get_credentials(current_user, user_id):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    mask = request.args.get('mask', 'true').lower() != 'false'
    return CredentialsController.get_user_credentials(user_id, mask)

@credentials_bp.route('/users/<int:user_id>/credentials', methods=['POST'])
@token_required
def create_credentials(current_user, user_id):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    data = request.get_json()
    return CredentialsController.create_credentials(user_id, data)

@credentials_bp.route('/users/<int:user_id>/credentials', methods=['PUT'])
@token_required
def update_credentials(current_user, user_id):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    data = request.get_json()
    return CredentialsController.update_credentials(user_id, data)

@credentials_bp.route('/users/<int:user_id>/credentials/<int:cred_num>', methods=['PUT'])
@token_required
def update_specific_credential(current_user, user_id, cred_num):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    data = request.get_json()
    return CredentialsController.update_specific_credential(user_id, cred_num, data)

@credentials_bp.route('/users/<int:user_id>/credentials', methods=['DELETE'])
@token_required
def delete_credentials(current_user, user_id):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    return CredentialsController.delete_credentials(user_id)

@credentials_bp.route('/users/<int:user_id>/credentials/<int:cred_num>', methods=['DELETE'])
@token_required
def delete_specific_credential(current_user, user_id, cred_num):
    if current_user.id != user_id:
        return {'error': 'Unauthorized'}, 403
    return CredentialsController.delete_specific_credential(user_id, cred_num)
