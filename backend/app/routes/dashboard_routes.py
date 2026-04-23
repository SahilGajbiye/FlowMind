from flask import Blueprint, jsonify
from app import db
from app.models.user import User
from app.models.logs import UserLog
from app.models.workflow import Workflow
from app.utils.decorators import token_required
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user):
    user_id = current_user.id
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Count directly from DB — reliable and always accurate
    total_workflows = Workflow.query.filter_by(user_id=user_id).count()

    # "Workflow updated" = each save/run, "workflow started" = explicit executions
    success_count = UserLog.query.filter(
        UserLog.user_id == user_id,
        UserLog.log_level == 'INFO',
        db.or_(
            UserLog.log_message.ilike('%workflow started%'),
            UserLog.log_message.ilike('%workflow updated%'),
            UserLog.log_message.ilike('%new workflow created%'),
        )
    ).count()

    failed_count = UserLog.query.filter(
        UserLog.user_id == user_id,
        UserLog.log_level == 'ERROR'
    ).count()

    # Total API calls = all log entries for this user
    api_calls = UserLog.query.filter_by(user_id=user_id).count()

    # Get recent logs (last 10 logs)
    recent_logs = UserLog.query.filter_by(user_id=user_id)\
                              .order_by(UserLog.created_at.desc())\
                              .limit(10)\
                              .all()
    
    return jsonify({
        'user_profile': user.to_dict(),
        'analytics': {
            'success_executions': success_count,
            'failed_executions': failed_count,
            'api_calls': api_calls,
            'workflows_created': total_workflows
        },
        'logs': {
            'recent_activity': [{
    'id': log.id,
    'user_id': log.user_id,
    'log_message': log.log_message,
    'log_level': log.log_level,
    'created_at': log.created_at.isoformat() if log.created_at else None
} for log in recent_logs],
        }
    }), 200
