from app import db
from app.models.logs import UserLog

def save_log(user_id, message, level="INFO"):
    log = UserLog(user_id=user_id, log_message=message, log_level=level)
    db.session.add(log)
    db.session.commit()
