from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS  # 1. Import CORS
from flask_jwt_extended import JWTManager
from app.config.config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # 2. Initialize CORS correctly.
    #    This specifically allows your frontend to make requests.
    cors = CORS(app)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Import your blueprints
    from app.routes.users_routes import user_bp
    from app.routes.credentials_routes import credentials_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.workflow_routes import workflow_bp
    from app.routes.dashboard_routes import dashboard_bp
    
    # 3. Register blueprints with specific, non-conflicting prefixes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # All user-related routes can share this prefix because the routes
    # inside the blueprint files are unique (e.g., '/<id>/credentials', '/<id>/workflows')
    app.register_blueprint(user_bp, url_prefix='/api/auth')
    app.register_blueprint(credentials_bp, url_prefix='/api')
    app.register_blueprint(workflow_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api') # Assuming dashboard routes are also user-specific
    
    with app.app_context():
        db.create_all()
    
    return app
