from flask import Flask
from flask_cors import CORS
from config import active_config
import os
import logging
from datetime import datetime


def create_app(config_object=active_config):
    """Create a Flask application using the app factory pattern with enhanced features."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Configure logging
    configure_logging(app)

    # Initialize CORS with more specific configuration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Get environment mode - safely check for environment
    env_mode = os.environ.get('FLASK_ENV', 'development')

    # Log application startup
    app.logger.info(f"Starting application in {env_mode} mode")

    # Ensure necessary directories exist
    ensure_directories(app)

    # Register blueprints
    from api.routes import register_blueprints
    register_blueprints(app)

    # Register additional routes
    register_additional_routes(app)

    return app


def configure_logging(app):
    """Configure application logging with enhanced formatting."""
    log_dir = os.path.join(os.getcwd(), 'logs')
    os.makedirs(log_dir, exist_ok=True)

    # Create log filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d")
    log_file = os.path.join(log_dir, f'app_{timestamp}.log')

    # Set up file handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter(
        '%(asctime)s [%(levelname)s] %(module)s.%(funcName)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_format)

    # Add handler to app logger
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)


def ensure_directories(app):
    """Ensure all required directories exist."""
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Ensure charts directory exists
    charts_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'charts')
    os.makedirs(charts_folder, exist_ok=True)

    # Ensure CV storage directory exists
    cv_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'cvs')
    os.makedirs(cv_folder, exist_ok=True)

    # Ensure temp directory exists
    temp_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'temp')
    os.makedirs(temp_folder, exist_ok=True)

    # Ensure logs directory exists
    logs_folder = os.path.join(os.getcwd(), 'logs')
    os.makedirs(logs_folder, exist_ok=True)

    app.logger.info("Application directories initialized")


def register_additional_routes(app):
    """Register additional application routes."""

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint for monitoring."""
        return {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0',
            'environment': os.environ.get('FLASK_ENV', 'development')
        }, 200

    @app.route('/api/version', methods=['GET'])
    def api_version():
        """API version information endpoint."""
        return {
            'version': '1.0.0',
            'release_date': '2023-01-01',
            'api_status': 'available'
        }, 200

    app.logger.info("Additional routes registered")


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))

    # Log startup information
    app.logger.info(f"Starting server on port {port}")

    # Run the application with debug mode from config
    debug_mode = getattr(active_config, 'DEBUG', False)
    app.run(host='0.0.0.0', port=port, debug=debug_mode)