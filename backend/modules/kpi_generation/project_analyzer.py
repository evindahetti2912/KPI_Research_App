class ProjectAnalyzer:
    """
    Class for analyzing project details to inform KPI generation.
    """

    @staticmethod
    def analyze_project_type(project_type):
        """
        Analyze the project type to determine relevant KPI categories.

        Args:
            project_type: Type of the project (e.g., "Web Development").

        Returns:
            dict: Relevant KPI categories and weights.
        """
        # Default weights for all project types
        default_weights = {
            "productivity": 0.25,
            "code_quality": 0.25,
            "collaboration": 0.25,
            "adaptability": 0.25
        }

        # Adjust weights based on project type
        if not project_type:
            return default_weights

        project_type_lower = project_type.lower()

        # Web Development: Higher emphasis on front-end quality and user experience
        if "web" in project_type_lower or "website" in project_type_lower:
            return {
                "productivity": 0.2,
                "code_quality": 0.3,
                "collaboration": 0.3,
                "adaptability": 0.2
            }

        # Mobile Development: Higher emphasis on code quality and performance
        elif "mobile" in project_type_lower or "app" in project_type_lower:
            return {
                "productivity": 0.2,
                "code_quality": 0.4,
                "collaboration": 0.2,
                "adaptability": 0.2
            }

        # Data Science: Higher emphasis on adaptability and collaboration
        elif "data" in project_type_lower or "analytics" in project_type_lower:
            return {
                "productivity": 0.2,
                "code_quality": 0.2,
                "collaboration": 0.3,
                "adaptability": 0.3
            }

        # Enterprise Solutions: Higher emphasis on productivity and code quality
        elif "enterprise" in project_type_lower or "business" in project_type_lower:
            return {
                "productivity": 0.3,
                "code_quality": 0.3,
                "collaboration": 0.2,
                "adaptability": 0.2
            }

        return default_weights

    @staticmethod
    def analyze_timeline(timeline_days, team_size):
        """
        Analyze project timeline to determine expected velocity and time-based KPIs.

        Args:
            timeline_days: Number of days for the project.
            team_size: Size of the project team.

        Returns:
            dict: Timeline analysis results.
        """
        if not timeline_days or not team_size:
            return {}

        # Calculate velocity based on team size and timeline
        # Assuming 2-week sprints and average 10 story points per developer per sprint
        sprint_duration = 14  # days
        sprints = max(1, int(timeline_days / sprint_duration))
        points_per_developer_per_sprint = 10

        # Expected velocity per sprint
        expected_velocity = team_size * points_per_developer_per_sprint

        # Total story points for the project
        total_story_points = expected_velocity * sprints

        # Expected burn rate (story points per day)
        burn_rate = total_story_points / timeline_days

        # Expected cycle time (hours per story point)
        # Assuming 6 productive hours per day
        hours_per_day = 6
        cycle_time = (team_size * hours_per_day * timeline_days) / total_story_points

        return {
            "sprints": sprints,
            "expected_velocity": expected_velocity,
            "total_story_points": total_story_points,
            "burn_rate": burn_rate,
            "expected_cycle_time": cycle_time
        }

    @staticmethod
    def analyze_technologies(technologies):
        """
        Analyze project technologies to determine technology-specific KPIs.

        Args:
            technologies: List of technologies used in the project.

        Returns:
            dict: Technology analysis results.
        """
        if not technologies:
            return {}

        # Convert to list if it's a comma-separated string
        if isinstance(technologies, str):
            tech_list = [tech.strip() for tech in technologies.split(',')]
        else:
            tech_list = technologies

        # Initialize technology categories
        tech_categories = {
            "frontend": False,
            "backend": False,
            "database": False,
            "mobile": False,
            "devops": False,
            "testing": False
        }

        # Technology keywords by category
        tech_keywords = {
            "frontend": ["html", "css", "javascript", "react", "angular", "vue", "jquery", "bootstrap", "typescript"],
            "backend": ["python", "java", "node", "express", "django", "spring", "php", "ruby", "rails", "asp.net",
                        "flask"],
            "database": ["sql", "mysql", "postgresql", "mongodb", "firebase", "oracle", "nosql", "redis", "sqlite"],
            "mobile": ["android", "ios", "swift", "kotlin", "react native", "flutter", "xamarin"],
            "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "gitlab", "github", "ci/cd",
                       "terraform"],
            "testing": ["selenium", "jest", "junit", "pytest", "mocha", "jasmine", "cypress", "testng"]
        }

        # Check each technology against keywords
        for tech in tech_list:
            tech_lower = tech.lower()
            for category, keywords in tech_keywords.items():
                if any(keyword in tech_lower for keyword in keywords):
                    tech_categories[category] = True

        # Determine preferred KPIs based on technology categories
        preferred_kpis = []

        if tech_categories["frontend"]:
            preferred_kpis.extend(["UI Test Coverage", "Accessibility Compliance", "Page Load Time"])

        if tech_categories["backend"]:
            preferred_kpis.extend(["API Response Time", "Server Error Rate", "Endpoint Test Coverage"])

        if tech_categories["database"]:
            preferred_kpis.extend(["Query Performance", "Database Migration Success Rate", "Data Integrity"])

        if tech_categories["mobile"]:
            preferred_kpis.extend(["App Crash Rate", "Battery Usage", "App Launch Time"])

        if tech_categories["devops"]:
            preferred_kpis.extend(["Deployment Frequency", "Mean Time to Recovery", "Change Failure Rate"])

        if tech_categories["testing"]:
            preferred_kpis.extend(["Test Coverage", "Defect Density", "Test Automation Percentage"])

        return {
            "tech_categories": tech_categories,
            "preferred_kpis": preferred_kpis
        }