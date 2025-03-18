import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
from datetime import datetime

from services.mongodb_service import mongodb_service
from modules.cv_processing.cv_parser import CVParser
from modules.cv_processing.cv_validator import CVValidator
from utils.file_utils import allowed_file, save_file
from utils.error_handlers import ValidationError, NotFoundError
from utils.json_utils import serialize_mongo

cv_blueprint = Blueprint('cv', __name__)


@cv_blueprint.route('/upload', methods=['POST'])
def upload_cv():
    """
    Endpoint for uploading a CV.
    Accepts a file upload and processes it.
    """
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            raise ValidationError("No file part in the request")

        file = request.files['file']

        # If the user does not select a file, the browser submits an empty file without a filename
        if file.filename == '':
            raise ValidationError("No file selected")

        # Check if the file is allowed
        if not allowed_file(file.filename):
            allowed_extensions = current_app.config['ALLOWED_EXTENSIONS']
            raise ValidationError(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")

        # Save the file
        filepath = save_file(file)

        # Parse the CV
        parsed_cv = CVParser.parse_cv(filepath)

        # Validate CV structure
        is_valid_structure, structure_errors = CVValidator.validate_cv_structure(parsed_cv)
        if not is_valid_structure:
            return jsonify({
                'success': False,
                'message': "CV structure validation failed",
                'errors': structure_errors,
                'parsed_data': serialize_mongo(parsed_cv)  # Include parsed data for debugging
            }), 400

        # Validate CV content
        is_valid_content, content_warnings = CVValidator.validate_cv_content(parsed_cv)

        # Enhance the parsed data
        enhanced_cv = CVParser.enhance_parsed_data(parsed_cv)

        # Store in MongoDB
        cv_id = mongodb_service.insert_one('Resumes', enhanced_cv)

        return jsonify({
            'success': True,
            'message': "CV uploaded and processed successfully",
            'cv_id': str(cv_id),
            'warnings': content_warnings,
            'parsed_data': serialize_mongo(enhanced_cv)  # Include enhanced data in the response
        })

    except Exception as e:
        # If an error occurs, return an error response
        return jsonify({
            'success': False,
            'message': f"Error processing CV: {str(e)}"
        }), 500


@cv_blueprint.route('/parse/<cv_id>', methods=['GET'])
def get_parsed_cv(cv_id):
    """
    Endpoint for retrieving a parsed CV by ID.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(cv_id)

        # Retrieve the CV from MongoDB
        cv_data = mongodb_service.find_one('Resumes', {'_id': object_id})

        if not cv_data:
            raise NotFoundError(f"CV with ID {cv_id} not found")

        return jsonify({
            'success': True,
            'data': serialize_mongo(cv_data)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving CV: {str(e)}"
        }), 500


@cv_blueprint.route('/list', methods=['GET'])
def list_cvs():
    """
    Endpoint for listing all parsed CVs.
    """
    try:
        # Retrieve all CVs from MongoDB
        cvs = mongodb_service.find_many('Resumes')

        return jsonify({
            'success': True,
            'total': len(cvs),
            'data': serialize_mongo(cvs)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error listing CVs: {str(e)}"
        }), 500


@cv_blueprint.route('/validate', methods=['POST'])
def validate_cv():
    """
    Endpoint for validating a CV without storing it.
    Accepts JSON data of a parsed CV.
    """
    try:
        data = request.json

        if not data:
            raise ValidationError("No data provided")

        # Validate CV structure
        is_valid_structure, structure_errors = CVValidator.validate_cv_structure(data)

        # Validate CV content
        is_valid_content, content_warnings = CVValidator.validate_cv_content(data)

        return jsonify({
            'success': True,
            'is_valid_structure': is_valid_structure,
            'structure_errors': structure_errors,
            'is_valid_content': is_valid_content,
            'content_warnings': content_warnings
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error validating CV: {str(e)}"
        }), 500