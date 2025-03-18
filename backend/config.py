import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')

    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    MONGO_DB = os.getenv('MONGO_DB', 'CVDatabase')

    # OpenAI API settings
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-key')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

    # Upload settings
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    MONGO_DB = os.getenv('MONGO_DB_TEST', 'CVDatabase_test')


class ProductionConfig(Config):
    """Production configuration."""
    # Production specific settings
    DEBUG = False


# Configuration dictionary
config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig
}

# Active configuration
active_config = config_by_name[os.getenv('FLASK_ENV', 'development')]