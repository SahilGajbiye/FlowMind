from app import db
from datetime import datetime, timezone

class UserLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    log_message = db.Column(db.Text, nullable=False)
    log_level = db.Column(db.String(20), default='INFO')
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))
