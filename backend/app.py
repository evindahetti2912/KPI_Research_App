from flask import Flask
from flask_cors import CORS
from config import active_config
import os


def create_app(config_object=active_config):
    """Create a Flask application using the app factory pattern."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Initialize CORS
    CORS(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Ensure charts directory exists
    charts_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'charts')
    os.makedirs(charts_folder, exist_ok=True)

    # Register blueprints
    from api.routes import register_blueprints
    register_blueprints(app)

    # Add health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy'}, 200

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000)