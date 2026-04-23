from app import db
from datetime import datetime, timezone

class Credentials(db.Model):
    __tablename__ = 'credentials'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), 
                       unique=True, nullable=False, index=True)
    
    cred1_api_key = db.Column(db.String(255), nullable=True)
    cred1_token = db.Column(db.Text, nullable=True)
    
    cred2_api_key = db.Column(db.String(255), nullable=True)
    cred2_token = db.Column(db.Text, nullable=True)
    
    cred3_api_key = db.Column(db.String(255), nullable=True)
    cred3_token = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        db.Index('idx_credentials_user_id', 'user_id'),
    )
    
    def to_dict(self, mask_sensitive=False):
        if mask_sensitive:
            return {
                'id': self.id,
                'user_id': self.user_id,
                'cred1': {
                    'api_key': self._mask_value(self.cred1_api_key),
                    'token': self._mask_value(self.cred1_token)
                },
                'cred2': {
                    'api_key': self._mask_value(self.cred2_api_key),
                    'token': self._mask_value(self.cred2_token)
                },
                'cred3': {
                    'api_key': self._mask_value(self.cred3_api_key),
                    'token': self._mask_value(self.cred3_token)
                },
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat()
            }
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'cred1': {
                'api_key': self.cred1_api_key,
                'token': self.cred1_token
            },
            'cred2': {
                'api_key': self.cred2_api_key,
                'token': self.cred2_token
            },
            'cred3': {
                'api_key': self.cred3_api_key,
                'token': self.cred3_token
            },
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @staticmethod
    def _mask_value(value):
        if not value:
            return None
        if len(value) <= 4:
            return '****'
        return '*' * (len(value) - 4) + value[-4:]
    
    def update_credential(self, cred_num, api_key=None, token=None):
        if cred_num == 1:
            if api_key is not None:
                self.cred1_api_key = api_key
            if token is not None:
                self.cred1_token = token
        elif cred_num == 2:
            if api_key is not None:
                self.cred2_api_key = api_key
            if token is not None:
                self.cred2_token = token
        elif cred_num == 3:
            if api_key is not None:
                self.cred3_api_key = api_key
            if token is not None:
                self.cred3_token = token
        else:
            raise ValueError("Credential number must be 1, 2, or 3")
