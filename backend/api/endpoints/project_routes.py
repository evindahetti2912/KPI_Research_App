from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
import json
from datetime import datetime

from services.mongodb_service import mongodb_service
from utils.error_handlers import ValidationError, NotFoundError

project_blueprint = Blueprint('projects', __name__)


@project_blueprint.route('', methods=['POST'])
def create_project():
    """
    Endpoint for creating a new project.
    """
    try:
        data = request.json

        if not data:
            raise ValidationError("No data provided")

        # Required fields
        required_fields = ['name', 'project_type', 'project_timeline', 'project_team_size']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            raise ValidationError(f"Missing required fields: {', '.join(missing_fields)}")

        # Add created_at timestamp
        data['created_at'] = datetime.now()

        # Add status if not provided
        if 'status' not in data:
            data['status'] = 'Planning'

        # Insert project into MongoDB
        project_id = mongodb_service.insert_one('Projects', data)

        return jsonify({
            'success': True,
            'message': "Project created successfully",
            'project_id': str(project_id)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error creating project: {str(e)}"
        }), 500


@project_blueprint.route('', methods=['GET'])
def get_all_projects():
    """
    Endpoint for retrieving all projects.
    """
    try:
        # Get all projects from MongoDB
        projects = mongodb_service.find_many('Projects')

        # Convert ObjectId to string for JSON serialization
        for project in projects:
            project['_id'] = str(project['_id'])
            if 'kpi_id' in project and project['kpi_id']:
                project['kpi_id'] = str(project['kpi_id'])

        return jsonify({
            'success': True,
            'total': len(projects),
            'data': projects
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving projects: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>', methods=['GET'])
def get_project(project_id):
    """
    Endpoint for retrieving a project by ID.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Retrieve the project from MongoDB
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Convert ObjectId to string for JSON serialization
        project['_id'] = str(project['_id'])
        if 'kpi_id' in project and project['kpi_id']:
            project['kpi_id'] = str(project['kpi_id'])

        return jsonify({
            'success': True,
            'data': project
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving project: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>', methods=['PUT'])
def update_project(project_id):
    """
    Endpoint for updating a project.
    """
    try:
        data = request.json

        if not data:
            raise ValidationError("No data provided")

        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Remove _id from the update data if present
        if '_id' in data:
            del data['_id']

        # Add updated_at timestamp
        data['updated_at'] = datetime.now()

        # Update the project in MongoDB
        result = mongodb_service.update_one('Projects', {'_id': object_id}, {'$set': data})

        return jsonify({
            'success': True,
            'message': f"Project updated successfully",
            'modified_count': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error updating project: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """
    Endpoint for deleting a project.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Delete any related KPIs
        if 'kpi_id' in project and project['kpi_id']:
            mongodb_service.delete_one('ProjectKPIs', {'_id': project['kpi_id']})

        # Delete the project from MongoDB
        result = mongodb_service.delete_one('Projects', {'_id': object_id})

        return jsonify({
            'success': True,
            'message': f"Project deleted successfully",
            'deleted_count': result
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error deleting project: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>/team', methods=['GET'])
def get_project_team(project_id):
    """
    Endpoint for retrieving a project's team composition.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Get team composition from project
        team = project.get('team', {})

        # If team has employee_ids, fetch employee details
        if 'employee_ids' in team and team['employee_ids']:
            employee_ids = team['employee_ids']

            # Convert string IDs to ObjectIds
            object_ids = [ObjectId(id) for id in employee_ids]

            # Fetch employees from MongoDB
            employees = mongodb_service.find_many('Resumes', {'_id': {'$in': object_ids}})

            # Convert ObjectId to string for JSON serialization
            for employee in employees:
                employee['_id'] = str(employee['_id'])

            team['employees'] = employees

        return jsonify({
            'success': True,
            'data': team
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving project team: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>/match-employees', methods=['POST'])
def match_employees_to_project(project_id):
    """
    Endpoint for matching employees to a project.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Get all employees from MongoDB
        employees = mongodb_service.find_many('Resumes')

        # Get project criteria
        project_criteria = {
            'languages': project.get('project_languages', ''),
            'field': project.get('project_type', 'Software Development'),
            'people_count': project.get('project_team_size', 1),
            'project_type': project.get('project_type', 'Software Development')
        }

        # Import candidate ranker here to avoid circular imports
        from modules.employee_matching.candidate_ranker import CandidateRanker
        from modules.employee_matching.skill_matcher import SkillMatcher
        from modules.employee_matching.experience_analyzer import ExperienceAnalyzer

        # Filter employees by experience if field is specified
        if 'field' in project_criteria and project_criteria['field']:
            filtered_employees = []

            for employee in employees:
                experience_items = employee.get('Experience', [])
                has_relevant_exp, _, _ = ExperienceAnalyzer.has_relevant_experience(
                    experience_items, project_criteria['field']
                )

                if has_relevant_exp:
                    filtered_employees.append(employee)

            employees = filtered_employees

        # Rank the candidates
        ranked_candidates = CandidateRanker.rank_candidates(employees, project_criteria)

        # Select the top N candidates
        people_count = int(project_criteria.get('people_count', 1))
        top_candidates = CandidateRanker.select_best_candidates(ranked_candidates, count=people_count)

        # Prepare response
        matched_employees = []

        for candidate_data in top_candidates:
            candidate = candidate_data['candidate']
            scores = candidate_data['scores']
            total_score = candidate_data['total_score']

            # Convert ObjectId to string
            candidate['_id'] = str(candidate['_id'])

            # Get skill gap
            candidate_skills = candidate.get('Skills', [])
            project_languages = project_criteria.get('languages', '').split(',') if isinstance(project_criteria.get('languages'), str) else project_criteria.get('languages', [])
            skill_gap = SkillMatcher.get_skill_gap(candidate_skills, project_languages)

            matched_employees.append({
                'employee': candidate,
                'scores': scores,
                'total_score': total_score,
                'skill_gap': skill_gap
            })

        # Update project with matched employees
        employee_ids = [candidate_data['employee']['_id'] for candidate_data in matched_employees]

        # Update the project in MongoDB
        mongodb_service.update_one(
            'Projects',
            {'_id': object_id},
            {'$set': {
                'team': {
                    'employee_ids': employee_ids,
                    'updated_at': datetime.now()
                }
            }}
        )

        return jsonify({
            'success': True,
            'matched_employees': matched_employees,
            'total_candidates': len(employees),
            'total_matches': len(matched_employees)
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error matching employees to project: {str(e)}"
        }), 500


@project_blueprint.route('/<project_id>/team/add-employee', methods=['POST'])
def add_employee_to_team(project_id):
    """
    Endpoint for adding an employee to a specific team role.
    """
    try:
        data = request.json
        if not data or 'employeeId' not in data or 'roleId' not in data:
            raise ValidationError("Missing required employee or role data")

        employee_id = data['employeeId']
        role_id = data['roleId']
        role_name = data.get('roleName', 'Unknown Role')

        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})
        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Initialize team data structure if needed
        if 'team' not in project:
            project['team'] = {
                'employee_ids': [],
                'role_assignments': [],
                'updated_at': datetime.now()
            }
        elif 'role_assignments' not in project['team']:
            project['team']['role_assignments'] = []

        # Check if employee already assigned to this role
        existing = next((item for item in project['team'].get('role_assignments', [])
                         if item.get('roleId') == role_id), None)

        if existing:
            # Update existing role assignment
            existing['employeeId'] = employee_id
            existing['updated_at'] = datetime.now()
        else:
            # Add new role assignment
            project['team']['role_assignments'].append({
                'roleId': role_id,
                'roleName': role_name,
                'employeeId': employee_id,
                'updated_at': datetime.now()
            })

        # Make sure employee_id is in the overall team list
        if 'employee_ids' not in project['team']:
            project['team']['employee_ids'] = []

        if employee_id not in project['team']['employee_ids']:
            project['team']['employee_ids'].append(employee_id)

        project['team']['updated_at'] = datetime.now()

        # Update the project in MongoDB
        mongodb_service.update_one(
            'Projects',
            {'_id': object_id},
            {'$set': {'team': project['team']}}
        )

        return jsonify({
            'success': True,
            'message': f"Employee assigned to role successfully",
            'role_assignments': project['team']['role_assignments']
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error assigning employee to role: {str(e)}"
        }), 500