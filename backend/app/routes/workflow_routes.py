from flask import Blueprint, request, jsonify
from app.controllers.workflow_controller import WorkflowController
from app.utils.decorators import token_required
import os
from werkzeug.utils import secure_filename

workflow_bp = Blueprint('workflows', __name__)

@workflow_bp.route('/workflows/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        upload_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.abspath(os.path.join(upload_dir, filename))
        file.save(filepath)
        return jsonify({'fileUrl': filepath}), 200
@workflow_bp.route('/workflows', methods=['GET'])
@token_required
def get_all_workflows(current_user):
    return WorkflowController.get_all_workflows(current_user.id)

@workflow_bp.route('/workflows/<string:workflow_id>', methods=['GET'])
@token_required
def get_workflow(current_user, workflow_id):
    return WorkflowController.get_workflow(current_user.id, workflow_id)

@workflow_bp.route('/workflows', methods=['POST'])
@token_required
def create_or_update_workflow(current_user):
    data = request.get_json()
    return WorkflowController.create_or_update_workflow(current_user.id, data)

@workflow_bp.route('/workflows/<string:workflow_id>', methods=['DELETE'])
@token_required
def delete_workflow(current_user, workflow_id):
    return WorkflowController.delete_workflow(current_user.id, workflow_id)

@workflow_bp.route('/workflows/search', methods=['GET'])
@token_required
def search_workflows(current_user):
    query = request.args.get('q', '')
    return WorkflowController.search_workflows(current_user.id, query)

@workflow_bp.route('/workflows/<string:workflow_id>/duplicate', methods=['POST'])
@token_required
def duplicate_workflow(current_user, workflow_id):
    return WorkflowController.duplicate_workflow(current_user.id, workflow_id)

@workflow_bp.route('/workflows/<string:workflow_id>/execute', methods=['POST'])
@token_required
def execute_workflow(current_user, workflow_id):
    data = request.get_json()
    return WorkflowController.execute_workflow(current_user.id, data)

@workflow_bp.route('/workflows/<string:workflow_id>/webhook', methods=['POST'])
def webhook_trigger(workflow_id):
    # Public endpoint to trigger a workflow
    payload = request.get_json() or {}
    return WorkflowController.trigger_webhook(workflow_id, payload)
