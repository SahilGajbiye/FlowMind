from app import db
from app.models.credentials import Credentials
from app.models.user import User
from flask import jsonify

class CredentialsController:
    
    @staticmethod
    def get_user_credentials(user_id, mask=True):
        user = User.query.get_or_404(user_id)
        
        if not user.credentials:
            return jsonify({'error': 'No credentials found for this user'}), 404
        
        return jsonify(user.credentials.to_dict(mask_sensitive=mask)), 200
    
    @staticmethod
    def create_credentials(user_id, data):
        user = User.query.get_or_404(user_id)
        
        if user.credentials:
            return jsonify({'error': 'Credentials already exist for this user. Use PUT to update.'}), 409
        
        credentials = Credentials(
            user_id=user_id,
            cred1_api_key=data.get('cred1', {}).get('api_key'),
            cred1_token=data.get('cred1', {}).get('token'),
            cred2_api_key=data.get('cred2', {}).get('api_key'),
            cred2_token=data.get('cred2', {}).get('token'),
            cred3_api_key=data.get('cred3', {}).get('api_key'),
            cred3_token=data.get('cred3', {}).get('token')
        )
        
        db.session.add(credentials)
        db.session.commit()
        
        return jsonify({
            'message': 'Credentials created successfully',
            'credentials': credentials.to_dict(mask_sensitive=True)
        }), 201
    
    @staticmethod
    def update_credentials(user_id, data):
        user = User.query.get_or_404(user_id)
        
        if not user.credentials:
            return jsonify({'error': 'No credentials found. Use POST to create.'}), 404
        
        credentials = user.credentials
        
        if 'cred1' in data:
            if 'api_key' in data['cred1']:
                credentials.cred1_api_key = data['cred1']['api_key']
            if 'token' in data['cred1']:
                credentials.cred1_token = data['cred1']['token']
        
        if 'cred2' in data:
            if 'api_key' in data['cred2']:
                credentials.cred2_api_key = data['cred2']['api_key']
            if 'token' in data['cred2']:
                credentials.cred2_token = data['cred2']['token']
        
        if 'cred3' in data:
            if 'api_key' in data['cred3']:
                credentials.cred3_api_key = data['cred3']['api_key']
            if 'token' in data['cred3']:
                credentials.cred3_token = data['cred3']['token']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Credentials updated successfully',
            'credentials': credentials.to_dict(mask_sensitive=True)
        }), 200
    
    @staticmethod
    def update_specific_credential(user_id, cred_num, data):
        if cred_num not in [1, 2, 3]:
            return jsonify({'error': 'Invalid credential number. Must be 1, 2, or 3'}), 400
        
        user = User.query.get_or_404(user_id)
        
        if not user.credentials:
            return jsonify({'error': 'No credentials found. Use POST to create.'}), 404
        
        credentials = user.credentials
        
        api_key = data.get('api_key')
        token = data.get('token')
        
        if api_key is None and token is None:
            return jsonify({'error': 'Must provide at least api_key or token'}), 400
        
        try:
            credentials.update_credential(cred_num, api_key, token)
            db.session.commit()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
        return jsonify({
            'message': f'Credential {cred_num} updated successfully',
            'credentials': credentials.to_dict(mask_sensitive=True)
        }), 200
    
    @staticmethod
    def delete_credentials(user_id):
        user = User.query.get_or_404(user_id)
        
        if not user.credentials:
            return jsonify({'error': 'No credentials found for this user'}), 404
        
        db.session.delete(user.credentials)
        db.session.commit()
        
        return jsonify({'message': 'Credentials deleted successfully'}), 200
    
    @staticmethod
    def delete_specific_credential(user_id, cred_num):
        if cred_num not in [1, 2, 3]:
            return jsonify({'error': 'Invalid credential number. Must be 1, 2, or 3'}), 400
        
        user = User.query.get_or_404(user_id)
        
        if not user.credentials:
            return jsonify({'error': 'No credentials found for this user'}), 404
        
        credentials = user.credentials
        
        if cred_num == 1:
            credentials.cred1_api_key = None
            credentials.cred1_token = None
        elif cred_num == 2:
            credentials.cred2_api_key = None
            credentials.cred2_token = None
        elif cred_num == 3:
            credentials.cred3_api_key = None
            credentials.cred3_token = None
        
        db.session.commit()
        
        return jsonify({
            'message': f'Credential {cred_num} cleared successfully',
            'credentials': credentials.to_dict(mask_sensitive=True)
        }), 200
