from app import db
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB

class Workflow(db.Model):
    __tablename__ = 'workflows'
    
    id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    workflow_data = db.Column(JSONB, nullable=False)
    thumbnail_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))
    
    user = db.relationship('User', backref='workflows')
    
    __table_args__ = (
        db.Index('idx_workflow_user_id', 'user_id'),
        db.Index('idx_workflow_name', 'name'),
        db.Index('idx_workflow_data', 'workflow_data', postgresql_using='gin'),
    )
    
    def to_dict(self, include_full_data=False):
        if include_full_data:
            return {
                'id': self.id,
                'user_id': self.user_id,
                'name': self.name,
                'nodes': self.workflow_data.get('nodes', []),
                'connections': self.workflow_data.get('connections', []),
                'created_at': self.created_at.isoformat(),
                'updated_at': self.updated_at.isoformat()
            }
        
        return {
            'id': self.id,
            'name': self.name,
            'thumbnail_url': self.thumbnail_url,
            'node_count': len(self.workflow_data.get('nodes', [])),
            'connection_count': len(self.workflow_data.get('connections', [])),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def update_workflow_data(self, nodes=None, connections=None):
        if nodes is not None:
            self.workflow_data['nodes'] = nodes
        if connections is not None:
            self.workflow_data['connections'] = connections
