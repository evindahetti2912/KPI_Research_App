import random
import json
from datetime import datetime, timedelta
from modules.kpi_generation.project_analyzer import ProjectAnalyzer
from services.openai_service import openai_service


class KPIGenerator:
    """
    Class for generating KPIs and metrics for software projects.
    Uses dynamic calculation and LLM insights instead of hardcoded values.
    """

    @staticmethod
    def generate_kpis(project_details):
        """
        Generate comprehensive KPIs based on project details.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            dict: Generated KPIs and metrics.
        """
        # Extract project parameters
        project_type = project_details.get('project_type', 'Software Development')
        team_size = int(project_details.get('project_team_size', 5))
        timeline = int(project_details.get('project_timeline', 90))
        technologies = project_details.get('project_languages', [])
        sprints = int(project_details.get('project_sprints', 5))

        # Analyze project to inform KPI generation
        type_analysis = ProjectAnalyzer.analyze_project_type(project_type)
        timeline_analysis = ProjectAnalyzer.analyze_timeline(timeline, team_size)
        tech_analysis = ProjectAnalyzer.analyze_technologies(technologies)

        # Try to use OpenAI for more intelligent KPI generation
        try:
            # Create a prompt for OpenAI to generate realistic KPI values
            kpi_prompt = f"""
            Based on the following project details:
            - Project Type: {project_type}
            - Team Size: {team_size}
            - Timeline: {timeline} days
            - Technologies: {', '.join(technologies) if isinstance(technologies, list) else technologies}
            - Number of Sprints: {sprints}

            Generate realistic KPI targets and current values for a software development project. 
            Follow these guidelines for each KPI:

            1. Productivity:
               - Velocity: What's a realistic story point velocity for this team size and project type?
               - Sprint Burndown Rate: What's a realistic daily story point completion rate?
               - Lead Time: What's a reasonable time from commit to deployment (in days)?
               - Cycle Time: What's a reasonable time to complete a task (in hours per story point)?
               - Story Completion Ratio: What percentage of planned stories should be completed?

            2. Code Quality:
               - Defect Density: What's a good target for defects per 1,000 LOC for this type of project?
               - Average Cyclomatic Complexity: What's a good target complexity value?
               - Test Coverage: What's an appropriate test coverage percentage for these technologies?
               - Code Churn: What percentage of code should be changed/refactored?
               - Rework Ratio: What percentage of time should be spent on rework?

            3. Collaboration:
               - Code Review Turnaround Time: How many hours for code review?
               - Merge Conflict Resolution Rate: What percentage of merge conflicts should be resolved?
               - Peer Review Effectiveness: What percentage of issues should be caught in review?

            4. Adaptability:
               - Feedback Implementation Rate: What percentage of feedback should be implemented?
               - Training Participation Rate: What percentage of training should be attended?
               - KPI Adjustment Responsiveness: How many days to adjust KPIs?

            Return only a valid JSON object. For each KPI, include 'value', 'target', and 'status'.
            Status should be one of: "On Track", "At Risk", or "Below Target".
            Include realistic variations between current value and target.
            """

            # Get KPI suggestions from OpenAI
            kpi_response = openai_service.generate_completion(kpi_prompt, temperature=0.5)

            try:
                # Parse the JSON response
                ai_generated_kpis = json.loads(kpi_response)
                kpis = ai_generated_kpis
            except (json.JSONDecodeError, TypeError):
                # Fallback to traditional generation if JSON parsing fails
                print("Failed to parse AI-generated KPIs, using fallback method")
                kpis = KPIGenerator._generate_fallback_kpis(team_size, sprints, timeline_analysis, tech_analysis)
        except Exception as e:
            print(f"Error generating AI-based KPIs: {e}")
            # Fallback to traditional generation
            kpis = KPIGenerator._generate_fallback_kpis(team_size, sprints, timeline_analysis, tech_analysis)

        return kpis

    @staticmethod
    def _generate_fallback_kpis(team_size, sprints, timeline_analysis, tech_analysis):
        """
        Generate KPIs using a rule-based approach as fallback when AI fails.

        Args:
            team_size: Size of the project team.
            sprints: Number of sprints.
            timeline_analysis: Results of timeline analysis.
            tech_analysis: Results of technology analysis.

        Returns:
            dict: Generated KPIs.
        """
        # Calculate realistic KPI values based on project parameters

        # Use timeline analysis to set realistic targets
        expected_velocity = timeline_analysis.get('expected_velocity', team_size * 10)
        expected_cycle_time = timeline_analysis.get('expected_cycle_time', 6)

        # Calculate current values with slight variations from targets
        current_velocity = max(1, int(expected_velocity * (0.8 + 0.4 * random.random())))
        current_burndown = expected_velocity / 10 * (0.7 + 0.6 * random.random())
        current_lead_time = random.randint(1, 3)
        current_cycle_time = expected_cycle_time * (0.8 + 0.4 * random.random())
        current_story_completion = random.randint(80, 98)

        # Productivity KPIs
        productivity_kpis = {
            "velocity": {
                "value": f"{current_velocity} story points per sprint",
                "target": f"{expected_velocity} story points per sprint",
                "status": "On Track" if current_velocity >= 0.85 * expected_velocity else "At Risk"
            },
            "sprint_burndown_rate": {
                "value": f"{current_burndown:.1f} story points per day",
                "target": f"{expected_velocity / 10:.1f} story points per day",
                "status": "On Track" if current_burndown >= 0.8 * (expected_velocity / 10) else "At Risk"
            },
            "lead_time": {
                "value": f"{current_lead_time} days",
                "target": "2 days",
                "status": "On Track" if current_lead_time <= 2 else "At Risk"
            },
            "cycle_time": {
                "value": f"{current_cycle_time:.1f} hours per story point",
                "target": f"{expected_cycle_time:.1f} hours per story point",
                "status": "On Track" if current_cycle_time <= 1.1 * expected_cycle_time else "At Risk"
            },
            "story_completion_ratio": {
                "value": f"{current_story_completion}%",
                "target": "90%",
                "status": "On Track" if current_story_completion >= 90 else "At Risk"
            }
        }

        # Adjust code quality targets based on technology categories
        tech_categories = tech_analysis.get('tech_categories', {})

        # Higher test coverage targets for backend and testing-focused projects
        test_coverage_target = 90 if tech_categories.get('backend', False) or tech_categories.get('testing',
                                                                                                  False) else 80
        complexity_target = 10 if tech_categories.get('frontend', False) else 15

        # Current values with variations
        current_defect_density = random.uniform(0.5, 2.0)
        current_complexity = random.randint(8, 20)
        current_test_coverage = random.randint(70, 95)
        current_code_churn = random.randint(10, 30)
        current_rework_ratio = random.randint(5, 15)

        # Code Quality KPIs
        code_quality_kpis = {
            "defect_density": {
                "value": f"{current_defect_density:.1f} defects per 1,000 LOC",
                "target": "1.0 defects per 1,000 LOC",
                "status": "On Track" if current_defect_density <= 1.0 else "At Risk"
            },
            "average_cyclomatic_complexity": {
                "value": str(current_complexity),
                "target": str(complexity_target),
                "status": "On Track" if current_complexity <= complexity_target else "At Risk"
            },
            "test_coverage": {
                "value": f"{current_test_coverage}%",
                "target": f"{test_coverage_target}%",
                "status": "On Track" if current_test_coverage >= test_coverage_target else "Below Target"
            },
            "code_churn": {
                "value": f"{current_code_churn}%",
                "target": "20%",
                "status": "On Track" if current_code_churn <= 20 else "At Risk"
            },
            "rework_ratio": {
                "value": f"{current_rework_ratio}%",
                "target": "10%",
                "status": "On Track" if current_rework_ratio <= 10 else "At Risk"
            }
        }

        # Adjust collaboration targets based on team size
        review_time_target = 8 if team_size <= 3 else 24  # Hours

        # Current values with variations
        current_review_time = random.randint(4, 36)
        current_merge_rate = random.randint(90, 100)
        current_peer_review = random.randint(70, 95)

        # Collaboration KPIs
        collaboration_kpis = {
            "code_review_turnaround_time": {
                "value": f"{current_review_time} hours",
                "target": f"{review_time_target} hours",
                "status": "On Track" if current_review_time <= review_time_target else "At Risk"
            },
            "merge_conflict_resolution_rate": {
                "value": f"{current_merge_rate}%",
                "target": "95%",
                "status": "On Track" if current_merge_rate >= 95 else "Below Target"
            },
            "peer_review_effectiveness": {
                "value": f"{current_peer_review}%",
                "target": "80%",
                "status": "On Track" if current_peer_review >= 80 else "Below Target"
            }
        }

        # Current values with variations
        current_feedback_rate = random.randint(70, 95)
        current_training_rate = random.randint(60, 100)
        current_kpi_responsiveness = random.randint(1, 5)

        # Adaptability KPIs
        adaptability_kpis = {
            "feedback_implementation_rate": {
                "value": f"{current_feedback_rate}%",
                "target": "85%",
                "status": "On Track" if current_feedback_rate >= 85 else "Below Target"
            },
            "training_participation_rate": {
                "value": f"{current_training_rate}%",
                "target": "80%",
                "status": "On Track" if current_training_rate >= 80 else "Below Target"
            },
            "kpi_adjustment_responsiveness": {
                "value": f"{current_kpi_responsiveness} days",
                "target": "3 days",
                "status": "On Track" if current_kpi_responsiveness <= 3 else "At Risk"
            }
        }

        # Combine all KPIs
        kpis = {
            "productivity": productivity_kpis,
            "code_quality": code_quality_kpis,
            "collaboration": collaboration_kpis,
            "adaptability": adaptability_kpis
        }

        return kpis

    @staticmethod
    def generate_gantt_chart_data(project_details):
        """
        Generate Gantt chart data for project planning.
        Uses project analysis to create realistic task schedules.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            list: List of tasks with start and end dates.
        """
        # Extract project parameters
        project_type = project_details.get('project_type', 'Software Development')
        timeline = int(project_details.get('project_timeline', 90))
        sprints = int(project_details.get('project_sprints', 5))
        team_size = int(project_details.get('project_team_size', 5))
        technologies = project_details.get('project_languages', [])

        # Try to use OpenAI for more intelligent task planning
        try:
            # Create a prompt for OpenAI to generate realistic Gantt chart tasks
            gantt_prompt = f"""
            Generate a Gantt chart timeline for a {project_type} project with the following details:
            - Total timeline: {timeline} days
            - Number of sprints: {sprints}
            - Team size: {team_size}
            - Technologies: {', '.join(technologies) if isinstance(technologies, list) else technologies}

            Create a list of tasks with their start and end days. Tasks should include:
            1. Project kickoff and planning
            2. Design and architecture
            3. Development sprints with overlapping testing
            4. Deployment preparation
            5. Final deployment and handover

            Return the data as a JSON array where each object has:
            - "Task": task name
            - "Start": "Day X" where X is the start day number
            - "End": "Day Y" where Y is the end day number

            Ensure tasks have realistic durations and dependencies. Some tasks can overlap.
            """

            # Get Gantt chart data suggestions from OpenAI
            gantt_response = openai_service.generate_completion(gantt_prompt, temperature=0.5)

            try:
                # Parse the JSON response
                gantt_data = json.loads(gantt_response)
                # Validate the structure
                if isinstance(gantt_data, list) and all(
                        isinstance(task, dict) and 'Task' in task and 'Start' in task and 'End' in task for task in
                        gantt_data):
                    return gantt_data
            except (json.JSONDecodeError, TypeError):
                # Fallback to traditional generation if JSON parsing fails
                print("Failed to parse AI-generated Gantt data, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based Gantt chart: {e}")

        # Fallback to rule-based Gantt chart generation
        return KPIGenerator._generate_fallback_gantt_data(project_type, timeline, sprints)

    @staticmethod
    def _generate_fallback_gantt_data(project_type, timeline, sprints):
        """
        Generate Gantt chart data using a rule-based approach as fallback.

        Args:
            project_type: Type of project.
            timeline: Project timeline in days.
            sprints: Number of sprints.

        Returns:
            list: Gantt chart data.
        """
        # Calculate sprint duration
        sprint_duration = timeline // sprints

        # Generate tasks for each sprint
        gantt_data = []

        # Project kickoff - always at the beginning
        gantt_data.append({
            "Task": "Project Kickoff",
            "Start": "Day 1",
            "End": "Day 3"
        })

        # Requirements & Planning - adjust duration based on project type
        req_end_day = sprint_duration // 2
        if project_type in ["Enterprise", "Data Science"]:
            req_end_day = max(req_end_day, 14)  # More planning for complex projects

        gantt_data.append({
            "Task": "Requirements Gathering",
            "Start": "Day 3",
            "End": f"Day {req_end_day}"
        })

        # Design phase - adjust overlap with requirements based on project type
        design_start_day = max(5, req_end_day // 2)  # Start design when requirements are partly done
        design_end_day = sprint_duration

        # Adjust for different project types
        if project_type in ["Web Development", "Mobile Development"]:
            # Design phase is shorter for web/mobile projects
            design_end_day = min(design_end_day, 21)
        elif project_type in ["Enterprise"]:
            # Design phase is longer for enterprise projects
            design_end_day = max(design_end_day, 28)

        gantt_data.append({
            "Task": "Design & Architecture",
            "Start": f"Day {design_start_day}",
            "End": f"Day {design_end_day}"
        })

        # Development sprints
        for i in range(1, sprints + 1):
            start_day = (i - 1) * sprint_duration + 1
            end_day = i * sprint_duration

            # Adjust first sprint to start after design for most project types
            if i == 1 and project_type not in ["Data Science"]:
                start_day = max(start_day, design_end_day - 3)  # Slight overlap with end of design

            gantt_data.append({
                "Task": f"Sprint {i} Development",
                "Start": f"Day {start_day}",
                "End": f"Day {end_day}"
            })

            # Add testing overlapping with development
            test_start = start_day + (sprint_duration // 3)  # Testing starts earlier
            test_end = min(end_day + (sprint_duration // 5), timeline)  # Testing can extend slightly past sprint

            gantt_data.append({
                "Task": f"Sprint {i} Testing",
                "Start": f"Day {test_start}",
                "End": f"Day {test_end}"
            })

        # Deployment and handover phases
        # Adjust deployment timing based on project type
        if project_type in ["Web Development", "Mobile Development"]:
            # Web/mobile often has continuous deployment
            deploy_start = max(timeline - 14, sprints * sprint_duration - 7)
        else:
            # Enterprise/data projects have more formal deployment
            deploy_start = max(timeline - 21, sprints * sprint_duration - 10)

        gantt_data.append({
            "Task": "Deployment Preparation",
            "Start": f"Day {deploy_start}",
            "End": f"Day {timeline - 3}"
        })

        gantt_data.append({
            "Task": "Final Deployment",
            "Start": f"Day {timeline - 5}",
            "End": f"Day {timeline - 1}"
        })

        gantt_data.append({
            "Task": "Project Handover",
            "Start": f"Day {timeline - 3}",
            "End": f"Day {timeline}"
        })

        return gantt_data

    @staticmethod
    def generate_employee_criteria(project_details):
        """
        Generate employee criteria for project staffing.
        Uses project analysis to determine required roles and skills.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            list: List of required roles and skills.
        """
        # Extract project parameters
        project_type = project_details.get('project_type', 'Software Development')
        team_size = int(project_details.get('project_team_size', 5))
        technologies = project_details.get('project_languages', [])
        timeline = int(project_details.get('project_timeline', 90))

        # Try to use OpenAI for more intelligent team composition
        try:
            # Create a prompt for OpenAI to generate realistic team requirements
            team_prompt = f"""
            For a {project_type} project with the following details:
            - Team size: {team_size} developers
            - Timeline: {timeline} days
            - Technologies: {', '.join(technologies) if isinstance(technologies, list) else technologies}

            Generate a list of required team roles and skills. The number of roles should match the team size of {team_size}.

            Return the data as a JSON array where each object has:
            - "role": The name of the role (e.g., "Frontend Developer", "DevOps Engineer")
            - "skills": An array of required skills for this role

            Ensure the roles and skills are realistic and specifically relevant to the technologies mentioned.
            """

            # Get team composition suggestions from OpenAI
            team_response = openai_service.generate_completion(team_prompt, temperature=0.5)

            try:
                # Parse the JSON response
                roles_data = json.loads(team_response)
                # Validate the structure
                if isinstance(roles_data, list) and all(
                        isinstance(role, dict) and 'role' in role and 'skills' in role for role in roles_data):
                    # Ensure we have the right number of roles
                    while len(roles_data) < team_size:
                        # Duplicate a role if needed
                        for role in roles_data[:]:
                            if len(roles_data) < team_size:
                                new_role = role.copy()
                                new_role["role"] = f"Senior {role['role']}" if "Senior" not in role[
                                    "role"] else f"Lead {role['role']}"
                                roles_data.append(new_role)
                            else:
                                break

                    # Trim extra roles if needed
                    if len(roles_data) > team_size:
                        roles_data = roles_data[:team_size]

                    return roles_data
            except (json.JSONDecodeError, TypeError):
                # Fallback to traditional generation if JSON parsing fails
                print("Failed to parse AI-generated team roles, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based team composition: {e}")

        # Fallback to rule-based team composition
        return KPIGenerator._generate_fallback_employee_criteria(project_type, team_size, technologies)

    @staticmethod
    def _generate_fallback_employee_criteria(project_type, team_size, technologies):
        """
        Generate employee criteria using a rule-based approach as fallback.

        Args:
            project_type: Type of project.
            team_size: Size of the team.
            technologies: List of technologies.

        Returns:
            list: Employee criteria data.
        """
        # Convert technologies to list if it's a string
        if isinstance(technologies, str):
            tech_list = [tech.strip() for tech in technologies.split(',')]
        else:
            tech_list = technologies

        # Analyze project technologies
        tech_analysis = ProjectAnalyzer.analyze_technologies(tech_list)
        tech_categories = tech_analysis.get('tech_categories', {})

        # Define roles based on technology categories and team size
        roles = []

        # Always include a project manager
        roles.append({
            "role": "Project Manager",
            "skills": ["Agile Methodologies", "Project Planning", "Risk Management", "Stakeholder Communication"]
        })

        # Add frontend developers if needed
        if tech_categories.get('frontend', False):
            frontend_skills = ["HTML", "CSS", "JavaScript"]
            for tech in tech_list:
                if tech.lower() in ["react", "angular", "vue", "jquery", "bootstrap", "typescript"]:
                    frontend_skills.append(tech)

            roles.append({
                "role": "Frontend Developer",
                "skills": frontend_skills
            })

        # Add backend developers if needed
        if tech_categories.get('backend', False):
            backend_skills = ["API Development", "Server Management"]
            for tech in tech_list:
                if tech.lower() in ["python", "java", "node", "express", "django", "spring", "php", "ruby", "rails",
                                    "asp.net", "flask"]:
                    backend_skills.append(tech)

            roles.append({
                "role": "Backend Developer",
                "skills": backend_skills
            })

        # Add database specialists if needed
        if tech_categories.get('database', False):
            db_skills = ["Database Design", "Data Modeling"]
            for tech in tech_list:
                if tech.lower() in ["sql", "mysql", "postgresql", "mongodb", "firebase", "oracle", "nosql", "redis",
                                    "sqlite"]:
                    db_skills.append(tech)

            roles.append({
                "role": "Database Specialist",
                "skills": db_skills
            })

        # Add mobile developers if needed
        if tech_categories.get('mobile', False):
            mobile_skills = ["Mobile UI Design", "App Development"]
            for tech in tech_list:
                if tech.lower() in ["android", "ios", "swift", "kotlin", "react native", "flutter", "xamarin"]:
                    mobile_skills.append(tech)

            roles.append({
                "role": "Mobile Developer",
                "skills": mobile_skills
            })

        # Add DevOps engineers if needed
        if tech_categories.get('devops', False):
            devops_skills = ["CI/CD", "Deployment Automation"]
            for tech in tech_list:
                if tech.lower() in ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "gitlab", "github",
                                    "terraform"]:
                    devops_skills.append(tech)

            roles.append({
                "role": "DevOps Engineer",
                "skills": devops_skills
            })

        # Add QA engineers
        qa_skills = ["Test Planning", "Test Automation", "Quality Assurance"]
        if tech_categories.get('testing', False):
            for tech in tech_list:
                if tech.lower() in ["selenium", "jest", "junit", "pytest", "mocha", "jasmine", "cypress", "testng"]:
                    qa_skills.append(tech)

        roles.append({
            "role": "QA Engineer",
            "skills": qa_skills
        })

        # Add data scientists for data projects
        if project_type.lower() in ["data science", "data analytics", "machine learning"]:
            data_skills = ["Data Analysis", "Statistical Modeling", "Machine Learning"]
            for tech in tech_list:
                if tech.lower() in ["python", "r", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn"]:
                    data_skills.append(tech)

            roles.append({
                "role": "Data Scientist",
                "skills": data_skills
            })

        # Adjust the number of roles based on team size
        if len(roles) > team_size:
            # Combine similar roles
            roles = roles[:team_size]
        elif len(roles) < team_size:
            # Duplicate roles as needed
            while len(roles) < team_size:
                for role in roles[:]:
                    if len(roles) < team_size:
                        new_role = role.copy()
                        new_role["role"] = f"Senior {role['role']}" if "Senior" not in role[
                            "role"] else f"Lead {role['role']}"
                        roles.append(new_role)
                    else:
                        break

        return roles

    @staticmethod
    def generate_sprint_breakdown(project_details):
        """
        Generate sprint breakdown for project planning.
        Uses project analysis to distribute tasks across sprints.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            dict: Sprint breakdown with tasks.
        """
        # Extract project parameters
        project_type = project_details.get('project_type', 'Software Development')
        sprints = int(project_details.get('project_sprints', 5))
        timeline = int(project_details.get('project_timeline', 90))
        technologies = project_details.get('project_languages', [])

        # Try to use OpenAI for more intelligent sprint planning
        try:
            # Create a prompt for OpenAI to generate realistic sprint breakdown
            sprint_prompt = f"""
            For a {project_type} project with the following details:
            - Timeline: {timeline} days
            - Number of sprints: {sprints}
            - Technologies: {', '.join(technologies) if isinstance(technologies, list) else technologies}

            Generate a detailed sprint-by-sprint breakdown with specific tasks for each sprint.

            Return the data as a JSON object where:
            - Keys are "Sprint 1", "Sprint 2", etc., through "Sprint {sprints}"
            - Values are arrays of task names appropriate for that sprint

            Ensure tasks follow a logical progression from initial setup through development to final deployment.
            Tasks should be specific to the project type and technologies, not generic.
            Earlier sprints should focus on setup and architecture, middle sprints on core development, 
            and later sprints on refinement, testing, and deployment preparation.
            """

            # Get sprint breakdown suggestions from OpenAI
            sprint_response = openai_service.generate_completion(sprint_prompt, temperature=0.5)

            try:
                # Parse the JSON response
                sprint_breakdown = json.loads(sprint_response)
                # Validate the structure
                if isinstance(sprint_breakdown, dict) and all(
                        key.startswith("Sprint ") for key in sprint_breakdown.keys()):
                    return sprint_breakdown
            except (json.JSONDecodeError, TypeError):
                # Fallback to traditional generation if JSON parsing fails
                print("Failed to parse AI-generated sprint breakdown, using fallback method")
        except Exception as e:
            print(f"Error generating AI-based sprint breakdown: {e}")

        # Fallback to rule-based sprint breakdown
        return KPIGenerator._generate_fallback_sprint_breakdown(project_type, sprints, technologies)

    @staticmethod
    def _generate_fallback_sprint_breakdown(project_type, sprints, technologies):
        """
        Generate sprint breakdown using a rule-based approach as fallback.

        Args:
            project_type: Type of project.
            sprints: Number of sprints.
            technologies: List of technologies.

        Returns:
            dict: Sprint breakdown data.
        """
        # Get technology list in proper format
        if isinstance(technologies, str):
            tech_list = [tech.strip() for tech in technologies.split(',')]
        else:
            tech_list = technologies

        # Define task templates based on project type
        task_templates = {
            "Web Development": [
                "Design UI mockups", "Implement responsive layout", "Create API endpoints",
                "Add authentication", "Integrate with backend", "Implement unit tests",
                "Set up CI/CD pipeline", "Performance optimization", "Browser compatibility testing",
                "Implement user dashboard", "Add search functionality", "Create admin interface",
                "Implement form validation", "Add data visualization", "Create user onboarding flow"
            ],
            "Mobile Development": [
                "Design app screens", "Implement UI components", "Create API clients",
                "Add local storage", "Implement authentication", "Add push notifications",
                "Performance testing", "Device compatibility testing", "App store preparation",
                "Implement offline mode", "Add user profile features", "Integrate analytics",
                "Create tutorial screens", "Implement in-app purchases", "Optimize for battery usage"
            ],
            "Data Science": [
                "Data collection", "Data cleaning", "Exploratory analysis",
                "Feature engineering", "Model development", "Model validation",
                "Dashboard creation", "Documentation", "Production deployment",
                "Data pipeline automation", "A/B test design", "Statistical analysis",
                "Model optimization", "Insights reporting", "Real-time prediction implementation"
            ],
            "Enterprise": [
                "Requirements analysis", "System architecture", "Data modeling",
                "Core functionality development", "Business logic implementation", "Integration testing",
                "User acceptance testing", "Documentation", "Training materials",
                "Legacy system integration", "Security compliance", "Role-based access control",
                "Audit logging", "Reporting module", "API gateway implementation"
            ]
        }

        # Get task template based on project type
        tasks = task_templates.get(project_type, task_templates["Web Development"])

        # Generate additional project-specific tasks based on technologies
        project_tasks = [
            "Setup development environment",
            "Create project documentation",
            "Define coding standards",
            "Set up version control"
        ]

        # Add technology-specific tasks
        for tech in tech_list:
            tech_lower = tech.lower()
            if "react" in tech_lower:
                project_tasks.extend(
                    ["Set up React component structure", "Configure state management", "Implement React routing"])
            elif "angular" in tech_lower:
                project_tasks.extend(
                    ["Set up Angular modules", "Create services and dependency injection", "Implement Angular routing"])
            elif "node" in tech_lower or "express" in tech_lower:
                project_tasks.extend(["Set up Node.js server", "Create API routes", "Implement middleware"])
            elif "mongodb" in tech_lower:
                project_tasks.extend(["Create MongoDB schema", "Implement database queries", "Set up indexing"])
            elif "python" in tech_lower:
                project_tasks.extend(
                    ["Set up Python virtual environment", "Configure package dependencies", "Create utility modules"])
            elif "docker" in tech_lower:
                project_tasks.extend(
                    ["Create Dockerfiles", "Set up container orchestration", "Configure CI/CD for containers"])
            elif "aws" in tech_lower or "azure" in tech_lower or "cloud" in tech_lower:
                project_tasks.extend(
                    ["Configure cloud resources", "Set up cloud security", "Implement cloud deployment"])

        # Add general tasks that apply to most projects
        common_tasks = [
            "Create database schema",
            "Set up logging and monitoring",
            "Implement error handling",
            "Perform security review",
            "Conduct performance testing",
            "Create user documentation"
        ]

        # Combine task lists
        all_tasks = tasks + project_tasks + common_tasks

        # Generate sprint breakdown
        sprint_breakdown = {}
        tasks_per_sprint = len(all_tasks) // sprints

        # Ensure we have enough tasks
        while len(all_tasks) < tasks_per_sprint * sprints:
            all_tasks.append(f"Additional optimization and refinement {len(all_tasks)}")

        for i in range(1, sprints + 1):
            start_idx = (i - 1) * tasks_per_sprint
            end_idx = start_idx + tasks_per_sprint

            if i == sprints:  # Last sprint gets any remaining tasks
                sprint_tasks = all_tasks[start_idx:]
            else:
                sprint_tasks = all_tasks[start_idx:end_idx]

            # Add sprint-specific tasks
            if i == 1:
                sprint_tasks.extend(["Initial setup", "Project planning", "Environment configuration"])
            elif i == 2:
                sprint_tasks.extend(["Architecture refinement", "Core component development"])
            elif i == sprints - 1:
                sprint_tasks.extend(["Integration testing", "Performance optimization"])
            elif i == sprints:
                sprint_tasks.extend(["Final testing", "Deployment preparation", "Documentation finalization"])

            sprint_breakdown[f"Sprint {i}"] = sprint_tasks

        return sprint_breakdown