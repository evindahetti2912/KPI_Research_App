class ProjectAnalyzer:
    """
    Enhanced class for analyzing project details to inform KPI generation.
    Provides deeper analysis of project parameters for more accurate KPI targets.
    """

    @staticmethod
    def analyze_project_type(project_type):
        """
        Analyze the project type to determine relevant KPI categories and weights.

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
                "adaptability": 0.2,
                "primary_focus": "user_experience",
                "complexity_level": "medium",
                "deployment_frequency": "high",
                "quality_expectations": {
                    "ui_consistency": "high",
                    "response_time": "low",
                    "browser_compatibility": "high"
                }
            }

        # Mobile Development: Higher emphasis on code quality and performance
        elif "mobile" in project_type_lower or "app" in project_type_lower:
            return {
                "productivity": 0.2,
                "code_quality": 0.4,
                "collaboration": 0.2,
                "adaptability": 0.2,
                "primary_focus": "performance",
                "complexity_level": "high",
                "deployment_frequency": "medium",
                "quality_expectations": {
                    "battery_efficiency": "high",
                    "offline_functionality": "medium",
                    "ui_responsiveness": "high"
                }
            }

        # Data Science: Higher emphasis on adaptability and collaboration
        elif "data" in project_type_lower or "analytics" in project_type_lower or "machine learning" in project_type_lower:
            return {
                "productivity": 0.2,
                "code_quality": 0.2,
                "collaboration": 0.3,
                "adaptability": 0.3,
                "primary_focus": "accuracy",
                "complexity_level": "very_high",
                "deployment_frequency": "low",
                "quality_expectations": {
                    "model_accuracy": "high",
                    "data_quality": "high",
                    "reproducibility": "high"
                }
            }

        # Enterprise Solutions: Higher emphasis on productivity and code quality
        elif "enterprise" in project_type_lower or "business" in project_type_lower:
            return {
                "productivity": 0.3,
                "code_quality": 0.3,
                "collaboration": 0.2,
                "adaptability": 0.2,
                "primary_focus": "reliability",
                "complexity_level": "high",
                "deployment_frequency": "low",
                "quality_expectations": {
                    "system_uptime": "very_high",
                    "data_integrity": "very_high",
                    "security": "very_high"
                }
            }

        # DevOps/CI-CD: Emphasis on automation and rapid deployment
        elif "devops" in project_type_lower or "ci" in project_type_lower or "cd" in project_type_lower:
            return {
                "productivity": 0.3,
                "code_quality": 0.2,
                "collaboration": 0.3,
                "adaptability": 0.2,
                "primary_focus": "automation",
                "complexity_level": "medium",
                "deployment_frequency": "very_high",
                "quality_expectations": {
                    "deployment_success_rate": "high",
                    "system_monitoring": "high",
                    "rollback_capability": "high"
                }
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

        # Calculate sprint duration (industry standard is 2 weeks)
        sprint_duration = 14  # days
        sprints = max(1, int(timeline_days / sprint_duration))

        # Calculate productivity metrics based on team size and experience level
        # Industry benchmark: Junior: 5-8 points, Mid: 8-13 points, Senior: 13-20 points per sprint
        points_per_developer_per_sprint_by_level = {
            "junior": 6.5,
            "mid": 10.5,
            "senior": 16.5
        }

        # Assume a typical team composition based on team size
        if team_size <= 3:
            # Small teams often have more senior composition
            team_composition = {"junior": 0.1, "mid": 0.3, "senior": 0.6}
        elif team_size <= 6:
            # Medium teams have balanced composition
            team_composition = {"junior": 0.2, "mid": 0.5, "senior": 0.3}
        else:
            # Larger teams often have more junior developers
            team_composition = {"junior": 0.3, "mid": 0.5, "senior": 0.2}

        # Calculate weighted average points per developer
        points_per_developer = sum(
            points_per_developer_per_sprint_by_level[level] * ratio
            for level, ratio in team_composition.items()
        )

        # Apply a complexity factor based on team size (larger teams have coordination overhead)
        if team_size <= 3:
            complexity_factor = 1.0  # No overhead
        elif team_size <= 6:
            complexity_factor = 0.9  # 10% overhead
        elif team_size <= 10:
            complexity_factor = 0.8  # 20% overhead
        else:
            complexity_factor = 0.7  # 30% overhead

        # Calculate adjusted points per developer
        adjusted_points_per_developer = points_per_developer * complexity_factor

        # Calculate expected velocity per sprint
        expected_velocity = round(team_size * adjusted_points_per_developer)

        # Calculate total story points for the project
        total_story_points = expected_velocity * sprints

        # Calculate burn rate (story points per day)
        burn_rate = total_story_points / timeline_days

        # Calculate expected cycle time (hours per story point)
        # Assume 6 productive hours per day per developer
        hours_per_day = 6
        total_productive_hours = team_size * hours_per_day * timeline_days
        cycle_time = total_productive_hours / total_story_points

        # Calculate lead time (time from code commit to production)
        # Varies based on team size and assumed deployment processes
        if team_size <= 3:
            lead_time = 1  # Small teams often have faster deployment
        elif team_size <= 6:
            lead_time = 2  # Medium teams have moderate deployment time
        else:
            lead_time = 3  # Larger teams have longer approval processes

        # Calculate story completion ratio target (realistic percentage based on industry averages)
        # Usually ranges from 80% to 95% depending on team maturity
        if team_size <= 3:
            story_completion_target = 90  # Small teams can be more predictable
        elif team_size <= 6:
            story_completion_target = 85  # Medium teams have moderate predictability
        else:
            story_completion_target = 80  # Larger teams have more variability

        # Return comprehensive analysis
        return {
            "sprints": sprints,
            "sprint_duration": sprint_duration,
            "expected_velocity": expected_velocity,
            "total_story_points": total_story_points,
            "burn_rate": burn_rate,
            "expected_cycle_time": cycle_time,
            "expected_lead_time": lead_time,
            "story_completion_target": story_completion_target,
            "team_composition": team_composition,
            "complexity_factor": complexity_factor
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
            "testing": False,
            "data_science": False,
            "cloud": False
        }

        # Technology keywords by category
        tech_keywords = {
            "frontend": ["html", "css", "javascript", "react", "angular", "vue", "jquery", "bootstrap",
                         "typescript", "sass", "less", "webpack", "gatsby", "nextjs", "nuxt"],
            "backend": ["python", "java", "node", "express", "django", "spring", "php", "ruby", "rails",
                        "asp.net", "flask", "fastapi", "laravel", "golang", "rust", "c#"],
            "database": ["sql", "mysql", "postgresql", "mongodb", "firebase", "oracle", "nosql", "redis",
                         "sqlite", "dynamodb", "cassandra", "couchdb", "neo4j", "graphql"],
            "mobile": ["android", "ios", "swift", "kotlin", "react native", "flutter", "xamarin",
                       "objective-c", "capacitor", "ionic", "cordova"],
            "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "gitlab", "github", "ci/cd",
                       "terraform", "ansible", "puppet", "chef", "prometheus", "grafana"],
            "testing": ["selenium", "jest", "junit", "pytest", "mocha", "jasmine", "cypress", "testng",
                        "espresso", "appium", "cucumber", "specflow", "postman", "soapui"],
            "data_science": ["tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "r", "matplotlib",
                             "tableau", "power bi", "jupyter", "keras", "hadoop", "spark", "airflow"],
            "cloud": ["aws", "azure", "gcp", "lambda", "s3", "ec2", "cloudfront", "route53", "cloudwatch",
                      "firebase", "heroku", "netlify", "vercel", "digitalocean"]
        }

        # Track specific technologies identified in each category
        identified_techs = {category: [] for category in tech_categories.keys()}

        # Check each technology against keywords
        for tech in tech_list:
            tech_lower = tech.lower()
            for category, keywords in tech_keywords.items():
                if any(keyword in tech_lower for keyword in keywords):
                    tech_categories[category] = True
                    identified_techs[category].append(tech)

        # Determine test coverage expectations based on identified technologies
        test_coverage_target = 70  # Default baseline

        # Adjust based on present technology categories
        if tech_categories["backend"]:
            test_coverage_target += 10  # Backend typically requires higher test coverage

        if tech_categories["data_science"]:
            test_coverage_target -= 10  # Data science often has lower test coverage

        if tech_categories["testing"]:
            test_coverage_target += 15  # Projects with dedicated testing tech have higher coverage

        # Cap at reasonable limits
        test_coverage_target = max(60, min(test_coverage_target, 95))

        # Determine code complexity targets
        complexity_target = 15  # Default

        if tech_categories["frontend"]:
            complexity_target = 12  # Frontend typically has lower complexity target

        if tech_categories["data_science"]:
            complexity_target = 18  # Data science can handle higher complexity

        # Determine defect density targets
        defect_density_target = 1.0  # Default (defects per 1000 LOC)

        if tech_categories["testing"]:
            defect_density_target = 0.8  # Better testing leads to lower defect targets

        if tech_categories["mobile"]:
            defect_density_target = 1.2  # Mobile often has higher defect tolerance

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

        if tech_categories["data_science"]:
            preferred_kpis.extend(["Model Accuracy", "Feature Importance Analysis", "Data Quality Score"])

        if tech_categories["cloud"]:
            preferred_kpis.extend(["Infrastructure Cost", "Service Availability", "Scaling Response Time"])

        # Determine technology complexity level
        num_categories = sum(1 for value in tech_categories.values() if value)
        if num_categories <= 2:
            stack_complexity = "Low"
        elif num_categories <= 4:
            stack_complexity = "Medium"
        else:
            stack_complexity = "High"

        return {
            "tech_categories": tech_categories,
            "identified_technologies": identified_techs,
            "preferred_kpis": preferred_kpis,
            "stack_complexity": stack_complexity,
            "test_coverage_target": test_coverage_target,
            "complexity_target": complexity_target,
            "defect_density_target": defect_density_target
        }

    @staticmethod
    def analyze_team_composition(team_size):
        """
        Analyze team composition to inform collaboration and communication KPIs.

        Args:
            team_size: Size of the project team.

        Returns:
            dict: Team composition analysis.
        """
        if not team_size:
            return {}

        # Determine team structure based on size
        if team_size <= 3:
            team_type = "small"
            roles = ["Tech Lead", "Full-stack Developer", "Frontend/Backend Developer"]
            communication_overhead = "low"
            coordination_complexity = "low"
            review_process = "peer"
        elif team_size <= 6:
            team_type = "medium"
            roles = ["Project Manager", "Tech Lead", "Frontend Developer",
                     "Backend Developer", "QA Engineer", "DevOps Engineer"]
            communication_overhead = "medium"
            coordination_complexity = "medium"
            review_process = "structured"
        else:
            team_type = "large"
            base_roles = ["Project Manager", "Tech Lead", "Frontend Developer",
                          "Backend Developer", "QA Engineer", "DevOps Engineer",
                          "UI/UX Designer", "Database Administrator"]
            # Add appropriate number of developers to reach team_size
            additional_roles = ["Frontend Developer", "Backend Developer", "Full-stack Developer"]
            roles = base_roles.copy()
            while len(roles) < team_size:
                roles.append(additional_roles[len(roles) % len(additional_roles)])

            communication_overhead = "high"
            coordination_complexity = "high"
            review_process = "formal"

        # Calculate expected code review turnaround time (hours)
        if team_type == "small":
            review_time = 4
        elif team_type == "medium":
            review_time = 8
        else:
            review_time = 16

        # Calculate expected collaboration metrics
        if team_type == "small":
            merge_conflict_rate = 0.05  # 5% of merges have conflicts
            peer_review_effectiveness = 0.85  # 85% of issues caught in review
        elif team_type == "medium":
            merge_conflict_rate = 0.10  # 10% of merges have conflicts
            peer_review_effectiveness = 0.80  # 80% of issues caught in review
        else:
            merge_conflict_rate = 0.15  # 15% of merges have conflicts
            peer_review_effectiveness = 0.75  # 75% of issues caught in review

        return {
            "team_type": team_type,
            "roles": roles,
            "communication_overhead": communication_overhead,
            "coordination_complexity": coordination_complexity,
            "review_process": review_process,
            "expected_review_time": review_time,
            "expected_merge_conflict_rate": merge_conflict_rate,
            "expected_peer_review_effectiveness": peer_review_effectiveness
        }

    @staticmethod
    def analyze_project_requirements(project_type, timeline_days):
        """
        Analyze project requirements to determine complexity and risk factors.

        Args:
            project_type: Type of the project.
            timeline_days: Number of days for the project.

        Returns:
            dict: Project requirements analysis.
        """
        if not project_type or not timeline_days:
            return {}

        project_type_lower = project_type.lower()

        # Determine baseline complexity by project type
        if "web" in project_type_lower:
            base_complexity = "medium"
            risk_profile = "low"
            security_requirements = "medium"
            performance_requirements = "medium"
        elif "mobile" in project_type_lower:
            base_complexity = "high"
            risk_profile = "medium"
            security_requirements = "high"
            performance_requirements = "high"
        elif "data" in project_type_lower:
            base_complexity = "high"
            risk_profile = "medium"
            security_requirements = "high"
            performance_requirements = "medium"
        elif "enterprise" in project_type_lower:
            base_complexity = "very high"
            risk_profile = "high"
            security_requirements = "very high"
            performance_requirements = "high"
        else:
            base_complexity = "medium"
            risk_profile = "medium"
            security_requirements = "medium"
            performance_requirements = "medium"

        # Adjust complexity based on timeline
        if timeline_days < 30:
            time_pressure = "high"
            complexity_adjustment = "reduced"  # Shorter timelines often mean reduced scope
        elif timeline_days < 90:
            time_pressure = "medium"
            complexity_adjustment = "normal"
        else:
            time_pressure = "low"
            complexity_adjustment = "expanded"  # Longer timelines often mean expanded scope

        # Calculate expected defect rates based on complexity and time pressure
        if base_complexity == "low" and time_pressure == "low":
            expected_defect_rate = 0.7  # defects per 1000 LOC
        elif base_complexity == "very high" and time_pressure == "high":
            expected_defect_rate = 2.0
        else:
            # Calculate based on factors (simplified formula)
            complexity_factor = {"low": 0.5, "medium": 1.0, "high": 1.5, "very high": 2.0}
            pressure_factor = {"low": 0.8, "medium": 1.0, "high": 1.3}

            expected_defect_rate = 1.0 * complexity_factor.get(base_complexity, 1.0) * pressure_factor.get(
                time_pressure, 1.0)
            expected_defect_rate = round(expected_defect_rate * 10) / 10  # Round to 1 decimal place

        return {
            "base_complexity": base_complexity,
            "risk_profile": risk_profile,
            "security_requirements": security_requirements,
            "performance_requirements": performance_requirements,
            "time_pressure": time_pressure,
            "complexity_adjustment": complexity_adjustment,
            "expected_defect_rate": expected_defect_rate
        }