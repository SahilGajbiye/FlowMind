from app import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))
    
    # New fields
    no_of_success_execution = db.Column(db.Integer, default=0)
    no_of_failed_execution = db.Column(db.Integer, default=0)
    no_of_api_calls = db.Column(db.Integer, default=0)
    no_of_workflows_created = db.Column(db.Integer, default=0)
    
    credentials = db.relationship('Credentials', backref='user', uselist=False, cascade='all, delete-orphan')
    
    __table_args__ = (
        db.Index('idx_user_email', 'email'),
        db.Index('idx_user_username', 'username'),
    )
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_credentials=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'no_of_success_execution': self.no_of_success_execution,
            'no_of_failed_execution': self.no_of_failed_execution,
            'no_of_api_calls': self.no_of_api_calls,
            'no_of_workflows_created': self.no_of_workflows_created
        }
        if include_credentials and self.credentials:
            data['credentials'] = self.credentials.to_dict()
        return data
