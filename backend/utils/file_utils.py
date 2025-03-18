import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename


def allowed_file(filename, allowed_extensions=None):
    """
    Check if a file has an allowed extension.

    Args:
        filename: The filename to check.
        allowed_extensions: Set of allowed extensions. If None, uses app config.

    Returns:
        bool: True if the file is allowed, False otherwise.
    """
    if allowed_extensions is None:
        allowed_extensions = current_app.config['ALLOWED_EXTENSIONS']

    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in allowed_extensions


def save_file(file, directory=None):
    """
    Save a file with a secure filename to the specified directory.

    Args:
        file: The file object to save.
        directory: Directory to save the file. If None, uses app config upload folder.

    Returns:
        str: Path to the saved file.
    """
    if directory is None:
        directory = current_app.config['UPLOAD_FOLDER']

    # Generate a secure filename with a UUID to prevent collisions
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(directory, unique_filename)

    # Save the file
    file.save(filepath)

    return filepath


def get_file_extension(filename):
    """
    Get the extension of a file.

    Args:
        filename: The filename to check.

    Returns:
        str: The file extension.
    """
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ""