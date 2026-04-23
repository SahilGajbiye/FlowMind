from app import db
from datetime import datetime, timezone

class RefreshToken(db.Model):
    __tablename__ = 'refresh_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = db.Column(db.Text, nullable=False, unique=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='refresh_tokens')
    
    __table_args__ = (
        db.Index('idx_refresh_token_user_id', 'user_id'),
        db.Index('idx_refresh_token_token', 'token'),
    )
    
    def is_valid(self):
        if self.revoked:
            return False
        if datetime.now(timezone.utc) > self.expires_at:
            return False
        return True
