import random
import json
from datetime import datetime, timedelta
from modules.kpi_generation.project_analyzer import ProjectAnalyzer


class KPIGenerator:
    """
    Class for generating KPIs and metrics for software projects.
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

        # Generate KPIs by category
        productivity_kpis = KPIGenerator.generate_productivity_kpis(team_size, sprints, timeline_analysis)
        code_quality_kpis = KPIGenerator.generate_code_quality_kpis(tech_analysis)
        collaboration_kpis = KPIGenerator.generate_collaboration_kpis(team_size)
        adaptability_kpis = KPIGenerator.generate_adaptability_kpis()

        # Combine all KPIs
        kpis = {
            "productivity": productivity_kpis,
            "code_quality": code_quality_kpis,
            "collaboration": collaboration_kpis,
            "adaptability": adaptability_kpis
        }

        return kpis

    @staticmethod
    def generate_productivity_kpis(team_size, sprints, timeline_analysis):
        """
        Generate productivity-related KPIs.

        Args:
            team_size: Size of the project team.
            sprints: Number of sprints.
            timeline_analysis: Results of timeline analysis.

        Returns:
            dict: Productivity KPIs.
        """
        # Use timeline analysis to set realistic targets
        expected_velocity = timeline_analysis.get('expected_velocity', team_size * 10)
        expected_cycle_time = timeline_analysis.get('expected_cycle_time', 6)

        velocity = {
            "value": f"{expected_velocity} story points per sprint",
            "target": f"{expected_velocity} story points per sprint",
            "status": "On Track"
        }

        sprint_burndown_rate = {
            "value": f"{expected_velocity / 10:.1f} story points per day",
            "target": f"{expected_velocity / 10:.1f} story points per day",
            "status": "On Track"
        }

        lead_time = {
            "value": f"{random.randint(1, 3)} days",
            "target": "2 days",
            "status": "On Track" if random.randint(1, 3) <= 2 else "At Risk"
        }

        cycle_time = {
            "value": f"{expected_cycle_time:.1f} hours per story point",
            "target": f"{expected_cycle_time:.1f} hours per story point",
            "status": "On Track"
        }

        story_completion_ratio = {
            "value": f"{random.randint(85, 95)}%",
            "target": "90%",
            "status": "On Track"
        }

        return {
            "velocity": velocity,
            "sprint_burndown_rate": sprint_burndown_rate,
            "lead_time": lead_time,
            "cycle_time": cycle_time,
            "story_completion_ratio": story_completion_ratio
        }

    @staticmethod
    def generate_code_quality_kpis(tech_analysis):
        """
        Generate code quality-related KPIs.

        Args:
            tech_analysis: Results of technology analysis.

        Returns:
            dict: Code quality KPIs.
        """
        # Adjust targets based on technology categories
        tech_categories = tech_analysis.get('tech_categories', {})

        # Higher test coverage targets for backend and testing-focused projects
        test_coverage_target = 90 if tech_categories.get('backend', False) or tech_categories.get('testing',
                                                                                                  False) else 80

        # Lower complexity targets for frontend projects
        complexity_target = 10 if tech_categories.get('frontend', False) else 15

        defect_density = {
            "value": f"{random.uniform(0.5, 2.0):.1f} defects per 1,000 LOC",
            "target": "1.0 defects per 1,000 LOC",
            "status": "On Track" if random.uniform(0.5, 2.0) <= 1.0 else "At Risk"
        }

        average_cyclomatic_complexity = {
            "value": str(random.randint(8, 20)),
            "target": str(complexity_target),
            "status": "On Track" if random.randint(8, 20) <= complexity_target else "At Risk"
        }

        test_coverage = {
            "value": f"{random.randint(70, 95)}%",
            "target": f"{test_coverage_target}%",
            "status": "On Track" if random.randint(70, 95) >= test_coverage_target else "Below Target"
        }

        code_churn = {
            "value": f"{random.randint(10, 30)}%",
            "target": "20%",
            "status": "On Track" if random.randint(10, 30) <= 20 else "At Risk"
        }

        rework_ratio = {
            "value": f"{random.randint(5, 15)}%",
            "target": "10%",
            "status": "On Track" if random.randint(5, 15) <= 10 else "At Risk"
        }

        return {
            "defect_density": defect_density,
            "average_cyclomatic_complexity": average_cyclomatic_complexity,
            "test_coverage": test_coverage,
            "code_churn": code_churn,
            "rework_ratio": rework_ratio
        }

    @staticmethod
    def generate_collaboration_kpis(team_size):
        """
        Generate collaboration-related KPIs.

        Args:
            team_size: Size of the project team.

        Returns:
            dict: Collaboration KPIs.
        """
        # Adjust targets based on team size
        review_time_target = 8 if team_size <= 3 else 24  # Hours

        code_review_turnaround_time = {
            "value": f"{random.randint(4, 36)} hours",
            "target": f"{review_time_target} hours",
            "status": "On Track" if random.randint(4, 36) <= review_time_target else "At Risk"
        }

        merge_conflict_resolution_rate = {
            "value": f"{random.randint(90, 100)}%",
            "target": "95%",
            "status": "On Track" if random.randint(90, 100) >= 95 else "Below Target"
        }

        peer_review_effectiveness = {
            "value": f"{random.randint(70, 95)}%",
            "target": "80%",
            "status": "On Track" if random.randint(70, 95) >= 80 else "Below Target"
        }

        return {
            "code_review_turnaround_time": code_review_turnaround_time,
            "merge_conflict_resolution_rate": merge_conflict_resolution_rate,
            "peer_review_effectiveness": peer_review_effectiveness
        }

    @staticmethod
    def generate_adaptability_kpis():
        """
        Generate adaptability-related KPIs.

        Returns:
            dict: Adaptability KPIs.
        """
        feedback_implementation_rate = {
            "value": f"{random.randint(70, 95)}%",
            "target": "85%",
            "status": "On Track" if random.randint(70, 95) >= 85 else "Below Target"
        }

        training_participation_rate = {
            "value": f"{random.randint(60, 100)}%",
            "target": "80%",
            "status": "On Track" if random.randint(60, 100) >= 80 else "Below Target"
        }

        kpi_adjustment_responsiveness = {
            "value": f"{random.randint(1, 5)} days",
            "target": "3 days",
            "status": "On Track" if random.randint(1, 5) <= 3 else "At Risk"
        }

        return {
            "feedback_implementation_rate": feedback_implementation_rate,
            "training_participation_rate": training_participation_rate,
            "kpi_adjustment_responsiveness": kpi_adjustment_responsiveness
        }

    @staticmethod
    def generate_gantt_chart_data(project_details):
        """
        Generate Gantt chart data for project planning.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            list: List of tasks with start and end dates.
        """
        # Extract project parameters
        timeline = int(project_details.get('project_timeline', 90))
        sprints = int(project_details.get('project_sprints', 5))

        # Calculate sprint duration
        sprint_duration = timeline // sprints

        # Generate tasks for each sprint
        gantt_data = []

        # Project kickoff
        gantt_data.append({
            "Task": "Project Kickoff",
            "Start": "Day 1",
            "End": "Day 3"
        })

        # Requirements & Planning
        gantt_data.append({
            "Task": "Requirements Gathering",
            "Start": "Day 3",
            "End": f"Day {sprint_duration // 2}"
        })

        # Design phase
        gantt_data.append({
            "Task": "Design & Architecture",
            "Start": f"Day {sprint_duration // 4}",
            "End": f"Day {sprint_duration}"
        })

        # Development sprints
        for i in range(1, sprints + 1):
            start_day = (i - 1) * sprint_duration + 1
            end_day = i * sprint_duration

            gantt_data.append({
                "Task": f"Sprint {i} Development",
                "Start": f"Day {start_day}",
                "End": f"Day {end_day}"
            })

            # Add testing overlapping with development
            test_start = start_day + (sprint_duration // 2)
            test_end = end_day + (sprint_duration // 4)
            test_end = min(test_end, timeline)  # Ensure we don't go beyond project timeline

            gantt_data.append({
                "Task": f"Sprint {i} Testing",
                "Start": f"Day {test_start}",
                "End": f"Day {test_end}"
            })

        # Deployment and handover
        deploy_start = max(timeline - 10, sprints * sprint_duration - 5)

        gantt_data.append({
            "Task": "Deployment Preparation",
            "Start": f"Day {deploy_start}",
            "End": f"Day {timeline - 3}"
        })

        gantt_data.append({
            "Task": "Final Deployment",
            "Start": f"Day {timeline - 3}",
            "End": f"Day {timeline}"
        })

        gantt_data.append({
            "Task": "Project Handover",
            "Start": f"Day {timeline - 2}",
            "End": f"Day {timeline}"
        })

        return gantt_data

    @staticmethod
    def generate_employee_criteria(project_details):
        """
        Generate employee criteria for project staffing.

        Args:
            project_details: Dictionary containing project information.

        Returns:
            list: List of required roles and skills.
        """
        # Extract project parameters
        project_type = project_details.get('project_type', 'Software Development')
        team_size = int(project_details.get('project_team_size', 5))
        technologies = project_details.get('project_languages', [])

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

        Args:
            project_details: Dictionary containing project information.

        Returns:
            dict: Sprint breakdown with tasks.
        """
        # Extract project parameters
        sprints = int(project_details.get('project_sprints', 5))
        project_type = project_details.get('project_type', 'Software Development')

        # Define task templates based on project type
        task_templates = {
            "Web Development": [
                "Design UI mockups", "Implement responsive layout", "Create API endpoints",
                "Add authentication", "Integrate with backend", "Implement unit tests",
                "Set up CI/CD pipeline", "Performance optimization", "Browser compatibility testing"
            ],
            "Mobile Development": [
                "Design app screens", "Implement UI components", "Create API clients",
                "Add local storage", "Implement authentication", "Add push notifications",
                "Performance testing", "Device compatibility testing", "App store preparation"
            ],
            "Data Science": [
                "Data collection", "Data cleaning", "Exploratory analysis",
                "Feature engineering", "Model development", "Model validation",
                "Dashboard creation", "Documentation", "Production deployment"
            ],
            "Enterprise": [
                "Requirements analysis", "System architecture", "Data modeling",
                "Core functionality development", "Business logic implementation", "Integration testing",
                "User acceptance testing", "Documentation", "Training materials"
            ]
        }

        # Get task template based on project type
        tasks = task_templates.get(project_type, task_templates["Web Development"])

        # Generate additional project-specific tasks
        project_tasks = [
            "Setup development environment",
            "Create project documentation",
            "Define coding standards",
            "Set up version control",
            "Create database schema",
            "Set up logging and monitoring",
            "Implement error handling",
            "Perform security review",
            "Conduct performance testing",
            "Create user documentation"
        ]

        # Combine task lists
        all_tasks = tasks + project_tasks

        # Generate sprint breakdown
        sprint_breakdown = {}
        tasks_per_sprint = len(all_tasks) // sprints

        for i in range(1, sprints + 1):
            start_idx = (i - 1) * tasks_per_sprint
            end_idx = start_idx + tasks_per_sprint

            if i == sprints:  # Last sprint gets any remaining tasks
                sprint_tasks = all_tasks[start_idx:]
            else:
                sprint_tasks = all_tasks[start_idx:end_idx]

            # Add sprint-specific tasks
            if i == 1:
                sprint_tasks.extend(["Initial setup", "Project planning"])
            elif i == sprints:
                sprint_tasks.extend(["Final testing", "Deployment preparation"])

            sprint_breakdown[f"Sprint {i}"] = sprint_tasks

        return sprint_breakdown