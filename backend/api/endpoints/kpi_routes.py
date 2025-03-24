from datetime import datetime

from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
import json

from services.mongodb_service import mongodb_service
from services.chart_service import chart_service
from modules.kpi_generation.kpi_generator import KPIGenerator
from modules.kpi_generation.chart_generator import ChartGenerator
from modules.kpi_generation.kpi_adjuster import KPIAdjuster
from utils.error_handlers import ValidationError, NotFoundError

kpi_blueprint = Blueprint('kpi', __name__)


@kpi_blueprint.route('/generate', methods=['POST'])
def generate_kpis():
    """
    Endpoint for generating KPIs based on project details.
    """
    try:
        data = request.json

        if not data:
            raise ValidationError("No data provided")

        # Generate KPIs
        kpis = KPIGenerator.generate_kpis(data)

        # Generate Gantt chart data
        gantt_data = KPIGenerator.generate_gantt_chart_data(data)

        # Generate employee criteria
        employee_criteria = KPIGenerator.generate_employee_criteria(data)

        # Generate sprint breakdown
        sprint_breakdown = KPIGenerator.generate_sprint_breakdown(data)

        # Prepare response
        response = {
            'kpis': kpis,
            'gantt_chart_data': gantt_data,
            'employee_criteria': employee_criteria,
            'sprint_breakdown': sprint_breakdown
        }

        return jsonify({
            'success': True,
            'data': response
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error generating KPIs: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/kpis', methods=['POST'])
def create_project_kpis(project_id):
    """
    Endpoint for creating KPIs for a specific project.
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

        # Generate KPIs
        kpis = KPIGenerator.generate_kpis(data)

        # Generate Gantt chart data
        gantt_data = KPIGenerator.generate_gantt_chart_data(data)

        # Generate employee criteria
        employee_criteria = KPIGenerator.generate_employee_criteria(data)

        # Generate sprint breakdown
        sprint_breakdown = KPIGenerator.generate_sprint_breakdown(data)

        # Generate charts
        try:
            # Generate Gantt chart
            gantt_chart_path = ChartGenerator.generate_gantt_chart(gantt_data, project_id)

            # Generate burndown chart
            burndown_chart_path = ChartGenerator.generate_burndown_chart(
                int(data.get('project_timeline', 90)),
                int(data.get('project_sprints', 5)),
                project_id
            )

            # Generate velocity chart
            velocity_chart_path = ChartGenerator.generate_velocity_chart(
                int(data.get('project_sprints', 5)),
                int(data.get('project_team_size', 5)),
                project_id
            )

            # Generate KPI radar chart
            kpi_radar_chart_path = ChartGenerator.generate_kpi_radar_chart(kpis, project_id)

            # Add chart paths to the data
            charts = {
                'gantt_chart': gantt_chart_path,
                'burndown_chart': burndown_chart_path,
                'velocity_chart': velocity_chart_path,
                'kpi_radar_chart': kpi_radar_chart_path
            }
        except Exception as chart_error:
            charts = {
                'error': f"Error generating charts: {str(chart_error)}"
            }

        # Create KPI document
        kpi_doc = {
            'project_id': object_id,
            'kpis': kpis,
            'gantt_chart_data': gantt_data,
            'employee_criteria': employee_criteria,
            'sprint_breakdown': sprint_breakdown,
            'charts': charts,
            'project_details': data,
            'created_at': datetime.now()
        }

        # Save KPIs to MongoDB
        kpi_id = mongodb_service.insert_one('ProjectKPIs', kpi_doc)

        # Update project with KPI ID
        mongodb_service.update_one(
            'Projects',
            {'_id': object_id},
            {'$set': {'kpi_id': kpi_id}}
        )

        return jsonify({
            'success': True,
            'message': "Project KPIs created successfully",
            'kpi_id': str(kpi_id),
            'data': {
                'kpis': kpis,
                'charts': charts
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error creating project KPIs: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/kpis', methods=['GET'])
def get_project_kpis(project_id):
    """
    Endpoint for retrieving KPIs for a specific project.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Get KPI document
        kpi_doc = mongodb_service.find_one('ProjectKPIs', {'project_id': object_id})

        if not kpi_doc:
            raise NotFoundError(f"KPIs for project with ID {project_id} not found")

        # Convert ObjectId to string for JSON serialization
        kpi_doc['_id'] = str(kpi_doc['_id'])
        kpi_doc['project_id'] = str(kpi_doc['project_id'])

        return jsonify({
            'success': True,
            'data': kpi_doc
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving project KPIs: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/charts/<chart_type>', methods=['GET'])
def get_project_chart(project_id, chart_type):
    """
    Endpoint for retrieving a specific chart for a project.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Get KPI document
        kpi_doc = mongodb_service.find_one('ProjectKPIs', {'project_id': object_id})

        if not kpi_doc:
            raise NotFoundError(f"KPIs for project with ID {project_id} not found")

        # Check if the chart exists
        if 'charts' not in kpi_doc or chart_type not in kpi_doc['charts']:
            raise NotFoundError(f"Chart of type {chart_type} not found for project with ID {project_id}")

        chart_path = kpi_doc['charts'][chart_type]

        # In a real API, you might return the file directly
        # For this example, we'll just return the path
        return jsonify({
            'success': True,
            'chart_path': chart_path
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving project chart: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/kpis/adjust', methods=['POST'])
def adjust_project_kpis(project_id):
    """
    Endpoint for adjusting KPIs based on project progress.
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

        # Get KPI document
        kpi_doc = mongodb_service.find_one('ProjectKPIs', {'project_id': object_id})

        if not kpi_doc:
            raise NotFoundError(f"KPIs for project with ID {project_id} not found")

        # Extract project progress from request
        project_progress = data.get('project_progress', {})

        # Extract team performance from request
        team_performance = data.get('team_performance', None)

        # Adjust KPIs based on progress
        original_kpis = kpi_doc['kpis']
        adjusted_kpis = KPIAdjuster.adjust_kpis_based_on_progress(
            original_kpis,
            project_progress,
            team_performance
        )

        # Update KPI document
        mongodb_service.update_one(
            'ProjectKPIs',
            {'_id': kpi_doc['_id']},
            {'$set': {
                'kpis': adjusted_kpis,
                'last_adjusted': datetime.now()
            }}
        )

        return jsonify({
            'success': True,
            'message': "Project KPIs adjusted successfully",
            'data': {
                'original_kpis': original_kpis,
                'adjusted_kpis': adjusted_kpis
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error adjusting project KPIs: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/kpis/adjust-for-changes', methods=['POST'])
def adjust_project_kpis_for_changes(project_id):
    """
    Endpoint for adjusting KPIs based on project changes.
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

        # Get KPI document
        kpi_doc = mongodb_service.find_one('ProjectKPIs', {'project_id': object_id})

        if not kpi_doc:
            raise NotFoundError(f"KPIs for project with ID {project_id} not found")

        # Extract updated project details from request
        updated_project = data.get('updated_project', {})

        if not updated_project:
            raise ValidationError("No updated project details provided")

        # Get original project details
        original_project = kpi_doc['project_details']

        # Adjust KPIs based on project changes
        original_kpis = kpi_doc['kpis']
        adjusted_kpis = KPIAdjuster.adjust_kpis_for_project_changes(
            original_kpis,
            original_project,
            updated_project
        )

        # Update KPI document
        mongodb_service.update_one(
            'ProjectKPIs',
            {'_id': kpi_doc['_id']},
            {'$set': {
                'kpis': adjusted_kpis,
                'project_details': updated_project,
                'last_adjusted': datetime.now()
            }}
        )

        return jsonify({
            'success': True,
            'message': "Project KPIs adjusted for changes successfully",
            'data': {
                'original_kpis': original_kpis,
                'adjusted_kpis': adjusted_kpis
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error adjusting project KPIs for changes: {str(e)}"
        }), 500


@kpi_blueprint.route('/projects/<project_id>/recommendations', methods=['GET'])
def get_project_kpi_recommendations(project_id):
    """
    Endpoint for retrieving KPI recommendations for a project.
    """
    try:
        # Convert string ID to ObjectId
        object_id = ObjectId(project_id)

        # Check if project exists
        project = mongodb_service.find_one('Projects', {'_id': object_id})

        if not project:
            raise NotFoundError(f"Project with ID {project_id} not found")

        # Get KPI document
        kpi_doc = mongodb_service.find_one('ProjectKPIs', {'project_id': object_id})

        if not kpi_doc:
            raise NotFoundError(f"KPIs for project with ID {project_id} not found")

        # Generate recommendations based on current KPIs
        try:
            kpis = kpi_doc.get('kpis', {})
            recommendations = []

            # Check for KPIs that are at risk or below target
            for category, metrics in kpis.items():
                for metric_name, metric_data in metrics.items():
                    if metric_data.get('status') in ['At Risk', 'Below Target']:
                        recommendations.append({
                            'title': f"Improve {metric_name.replace('_', ' ').title()}",
                            'description': f"This {category} metric is currently {metric_data.get('status').lower()}. Current value: {metric_data.get('value')}, Target: {metric_data.get('target')}.",
                            'actionItems': [
                                f"Review {category} practices related to {metric_name.replace('_', ' ')}",
                                f"Consider adjusting the target if it's unrealistic for this project"
                            ],
                            'priority': 'high' if metric_data.get('status') == 'Below Target' else 'medium',
                            'category': category
                        })

            return jsonify({
                'success': True,
                'recommendations': recommendations
            })
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return jsonify({
                'success': True,
                'recommendations': []
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error retrieving project KPI recommendations: {str(e)}"
        }), 500