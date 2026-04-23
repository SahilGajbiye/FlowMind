from app import db
import json
from app.models.workflow import Workflow
from app.models.user import User
from flask import jsonify
from datetime import datetime, timezone
from app.utils.logger import save_log

class WorkflowController:
    
    @staticmethod
    def get_all_workflows(user_id):
        workflows = Workflow.query.filter_by(user_id=user_id).order_by(Workflow.updated_at.desc()).all()
        
        return jsonify({
            'workflows': [workflow.to_dict() for workflow in workflows],
            'total': len(workflows)
        }), 200
    
    @staticmethod
    def get_workflow(user_id, workflow_id):
        workflow = Workflow.query.filter_by(id=workflow_id, user_id=user_id).first()
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        return jsonify(workflow.to_dict(include_full_data=True)), 200
    
    @staticmethod
    def create_or_update_workflow(user_id, data):
        workflow_id = data.get('id')
        name = data.get('name')
        nodes = data.get('nodes', [])
        connections = data.get('connections', [])
        thumbnail_url = data.get('thumbnail_url', None)
    
        if not workflow_id or not name:
            return jsonify({'error': 'Workflow id and name are required'}), 400
    
        workflow = Workflow.query.filter_by(id=workflow_id, user_id=user_id).first()
    
        if workflow:
            workflow.name = name
            workflow.workflow_data = {
                'nodes': nodes,
                'connections': connections
            }
            if thumbnail_url:
                workflow.thumbnail_url = thumbnail_url
            workflow.updated_at = datetime.now(timezone.utc)
        
            db.session.commit()
            save_log(user_id, f"Workflow updated - ID: {workflow_id}, Name: {name}, Nodes: {len(nodes)}, Connections: {len(connections)}")
        
            return jsonify({
                'message': 'Workflow updated successfully',
                'workflow': workflow.to_dict(include_full_data=True)
            }), 200
        else:
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
    
            current_count = user.no_of_workflows_created or 0
            user.no_of_workflows_created = current_count + 1
    
            new_workflow = Workflow(
                id=workflow_id,
                user_id=user_id,
                name=name,
                thumbnail_url=thumbnail_url,
                workflow_data={
                    'nodes': nodes,
                    'connections': connections
                }
            )
    
            db.session.add(new_workflow)
            db.session.commit()
        
        save_log(user_id, f"New workflow created - ID: {workflow_id}, Name: {name}, Nodes: {len(nodes)}, Connections: {len(connections)}")
        
        return jsonify({
            'message': 'Workflow created successfully',
            'workflow': new_workflow.to_dict(include_full_data=True)
        }), 201
    
    @staticmethod
    def delete_workflow(user_id, workflow_id):
        workflow = Workflow.query.filter_by(id=workflow_id, user_id=user_id).first()
        
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        workflow_name = workflow.name
        db.session.delete(workflow)
        db.session.commit()
        save_log(user_id, f"Workflow deleted - ID: {workflow_id}, Name: {workflow_name}")
        
        return jsonify({'message': 'Workflow deleted successfully'}), 200
    
    @staticmethod
    def search_workflows(user_id, query):
        workflows = Workflow.query.filter(
            Workflow.user_id == user_id,
            Workflow.name.ilike(f'%{query}%')
        ).order_by(Workflow.updated_at.desc()).all()
        
        return jsonify({
            'workflows': [workflow.to_dict() for workflow in workflows],
            'total': len(workflows)
        }), 200
    
    @staticmethod
    def duplicate_workflow(user_id, workflow_id):
        original_workflow = Workflow.query.filter_by(id=workflow_id, user_id=user_id).first()
        
        if not original_workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        import time
        new_id = f"wf_{int(time.time() * 1000)}_copy"
        new_name = f"{original_workflow.name} (Copy)"
        
        new_workflow = Workflow(
            id=new_id,
            user_id=user_id,
            name=new_name,
            workflow_data=original_workflow.workflow_data.copy()
        )
        
        db.session.add(new_workflow)
        db.session.commit()
        save_log(user_id, f"Workflow duplicated - Original ID: {workflow_id}, New ID: {new_id}, Name: {new_name}")
        
        return jsonify({
            'message': 'Workflow duplicated successfully',
            'workflow': new_workflow.to_dict(include_full_data=True)
        }), 201
    
    @staticmethod
    def execute_workflow(user_id, workflow_data):
        # Save/update workflow (unchanged)
        WorkflowController.create_or_update_workflow(user_id, workflow_data)

        from app.controllers.tasks import run_workflow

        workflow_config_string = json.dumps(workflow_data)

        print("CLIENT: Queuing the dynamic workflow...")

        try:
            # ✅ ONLY trigger task (NO blocking)
            # Inject user_id so worker can update success/failure stats
            workflow_data_with_user = {**workflow_data, 'user_id': user_id}
            orchestrator_task = run_workflow.delay(json.dumps(workflow_data_with_user))

            print(f"CLIENT: Workflow started with task ID: {orchestrator_task.id}")
            save_log(user_id, f"Workflow started successfully - Name: {workflow_data.get('name', 'Unknown')}", level="INFO")

            return jsonify({
                'message': 'Workflow started successfully',
                'task_id': orchestrator_task.id
            }), 200

        except Exception as e:
            print("ERROR:", str(e))

            return jsonify({
                'error': 'Workflow queue/worker unavailable',
                'details': str(e)
            }), 503

    @staticmethod
    def trigger_webhook(workflow_id, payload):
        workflow = Workflow.query.filter_by(id=workflow_id).first()
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        from app.controllers.tasks import run_workflow
        
        workflow_config_string = json.dumps(workflow.workflow_data)
        payload_string = json.dumps(payload)
        
        orchestrator_task = run_workflow.delay(workflow_config_string, payload_string)
        return jsonify({
            'message': 'Webhook triggered successfully',
            'task_id': orchestrator_task.id
        }), 200
