import openai
from config import active_config
import json
import time

# Set the OpenAI API key
openai.api_key = active_config.OPENAI_API_KEY


class OpenAIService:
    """
    Enhanced service for OpenAI API operations.
    Provides specialized methods for project analysis and KPI generation.
    """

    @staticmethod
    def generate_completion(prompt, model=None, temperature=0.7, max_tokens=1500):
        """Generate a completion using OpenAI's ChatCompletion API."""
        try:
            # Add retry logic for API rate limits
            max_retries = 3
            retry_delay = 2  # seconds

            for attempt in range(max_retries):
                try:
                    response = openai.ChatCompletion.create(
                        model=model or active_config.OPENAI_MODEL,
                        messages=[
                            {"role": "system",
                             "content": "You are a helpful assistant specializing in software project management, KPI analysis, and team performance optimization."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    return response["choices"][0]["message"]["content"].strip()
                except openai.error.RateLimitError:
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                    else:
                        raise
        except Exception as e:
            print(f"Error in OpenAI API call: {e}")
            raise

    @staticmethod
    def parse_cv_data(extracted_text):
        """Parse CV text into structured format using OpenAI."""
        prompt = f"""
        The following is the text extracted from a CV. Your task is to structure it into the required format below:

        Required Format:
        {{
            "Name": "<Name>",
            "Contact Information": {{
                "Email": "<Email>",
                "Phone": "<Phone>",
                "Address": "<Address>",
                "LinkedIn": "<LinkedIn>"
            }},
            "Skills": ["Skill1", "Skill2", "..."],
            "Experience": [
                {{
                    "Role": "<Role>",
                    "Company": "<Company>",
                    "Duration": "<Start Date> - <End Date>",
                    "Responsibilities": [
                        "Responsibility1",
                        "Responsibility2",
                        "..."
                    ]
                }}
            ],
            "Education": [
                {{
                    "Degree": "<Degree>",
                    "Institution": "<Institution>",
                    "Duration": "<Start Date> - <End Date>",
                    "Details": "<Details>"
                }}
            ],
            "Certifications and Courses": ["Course1", "Course2", "..."],
            "Extra-Curricular Activities": ["Activity1", "Activity2", "..."]
        }}

        Here is the extracted text:
        {extracted_text}

        If any fields are empty, represent them as an empty list `[]` or an empty object `{{}}`.
        Ensure all JSON keys and formatting are consistent with the provided structure.
        """
        return OpenAIService.generate_completion(prompt, temperature=0)

    @staticmethod
    def generate_kpis(project_details):
        """
        Generate KPIs for a project using OpenAI's advanced capabilities.
        Creates comprehensive, realistic KPI targets based on project parameters.

        Args:
            project_details: Dictionary of project details.

        Returns:
            dict: Generated KPIs with targets and descriptions.
        """
        prompt = f"""
        You are a Project Management KPI specialist. Based on the following project details:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Technologies: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Generate comprehensive KPIs grouped into the following categories:
        1. Productivity & Agile Performance
        2. Code Quality & Efficiency 
        3. Collaboration & Communication
        4. Adaptability & Continuous Improvement

        For each KPI, include:
        - A realistic baseline value (current)
        - A realistic target value
        - A status indicator ("On Track", "At Risk", or "Below Target")

        The KPIs should follow this structure:
        {{
          "productivity": {{
            "velocity": {{ "value": "X story points per sprint", "target": "Y story points per sprint", "status": "Status" }},
            "sprint_burndown_rate": {{ "value": "X story points per day", "target": "Y story points per day", "status": "Status" }},
            ... other productivity KPIs
          }},
          "code_quality": {{
            "defect_density": {{ "value": "X defects per 1,000 LOC", "target": "Y defects per 1,000 LOC", "status": "Status" }},
            ... other code quality KPIs
          }},
          ... other categories
        }}

        Base your targets on industry standards for this project type, team size, and technology stack.
        Current values should show realistic variations from targets - some ahead, some behind.
        Ensure KPI values match the project details logically (e.g., larger teams should have higher velocity).
        """

        try:
            kpi_response = OpenAIService.generate_completion(prompt, temperature=0.4)
            kpis = json.loads(kpi_response)
            return kpis
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error generating KPIs with OpenAI: {e}")
            # Return empty structure for fallback to traditional generation
            return {}

    @staticmethod
    def analyze_project_complexity(project_details):
        """
        Analyze project complexity and risk factors using OpenAI.
        Provides insights for KPI calibration and team planning.

        Args:
            project_details: Dictionary of project details.

        Returns:
            dict: Analysis of project complexity and risk factors.
        """
        prompt = f"""
        As a Project Analysis expert, analyze the complexity and risk factors for this project:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Technologies: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Provide a detailed analysis including:
        1. Overall project complexity rating (Low, Medium, High, Very High)
        2. Technical complexity assessment
        3. Team coordination complexity
        4. Timeline risk assessment
        5. Technology risk factors
        6. Recommended focus areas for KPIs

        Return your analysis as a structured JSON object with clear ratings and detailed explanations.
        """

        try:
            analysis_response = OpenAIService.generate_completion(prompt, temperature=0.3, max_tokens=2000)
            analysis = json.loads(analysis_response)
            return analysis
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error analyzing project with OpenAI: {e}")
            # Return basic analysis for fallback
            return {
                "complexity_rating": "Medium",
                "focus_areas": ["Productivity", "Quality"],
                "risks": ["Timeline constraints", "Technology stack complexity"]
            }

    @staticmethod
    def recommend_skill_development(employee_data, project_criteria):
        """Recommend skills for development based on employee data and project criteria."""
        prompt = f"""
        You are a career advisor. Based on the following project requirements and employee's skills, recommend skills, 
        languages, or technologies they should pursue to grow in their career.

        Project Requirements:
        {{
            "Languages": "{project_criteria.get('languages', 'N/A')}",
            "Relevant Field": "{project_criteria.get('field', 'N/A')}"
        }}

        Employee Data:
        {employee_data}

        Provide detailed recommendations for the employee, including specific courses, certifications, or resources 
        they could use to acquire these skills. Include both technical and soft skills that would help them excel 
        in projects with these requirements.

        Format your response as a structured JSON object with clear categories of skills to develop and specific 
        resources for each.
        """
        return OpenAIService.generate_completion(prompt, temperature=0.7)

    @staticmethod
    def generate_gantt_chart_data(project_details):
        """
        Generate detailed Gantt chart data for project planning.
        Creates realistic task timelines based on project parameters.

        Args:
            project_details: Dictionary of project details.

        Returns:
            list: Detailed Gantt chart data with tasks, dependencies and timing.
        """
        prompt = f"""
        As a Project Planning expert, create a detailed Gantt chart for this project:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Technologies: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Generate a comprehensive task breakdown with:
        1. Task name
        2. Start day (as "Day X" format)
        3. End day (as "Day Y" format)

        Tasks should include:
        - Project kickoff/planning
        - Design and architecture phases
        - Development sprints
        - Testing phases
        - Deployment preparation
        - Final deployment and handover

        Tasks should follow a logical sequence with appropriate overlaps and dependencies.
        The total timeline should match the provided project timeline of {project_details.get('project_timeline', 'N/A')} days.

        Return your Gantt chart data as a JSON array of task objects, each with "Task", "Start", and "End" properties.
        For example: [{"Task": "Project Kickoff", "Start": "Day 1", "End": "Day 3"}, ...]
        """

        try:
            gantt_response = OpenAIService.generate_completion(prompt, temperature=0.4)
            gantt_data = json.loads(gantt_response)
            return gantt_data
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error generating Gantt data with OpenAI: {e}")
            # Return empty list for fallback
            return []

    @staticmethod
    def generate_sprint_breakdown(project_details):
        """
        Generate detailed sprint breakdown for project planning.
        Creates realistic sprint tasks based on project parameters.

        Args:
            project_details: Dictionary of project details.

        Returns:
            dict: Sprint breakdown with detailed tasks for each sprint.
        """
        prompt = f"""
        As an Agile Sprint Planning expert, create a detailed sprint breakdown for this project:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Technologies: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Generate a detailed breakdown of tasks for each sprint, considering:
        1. The project type and its typical lifecycle
        2. The technology stack and implementation order
        3. A logical progression from planning to deployment
        4. Technical dependencies between components

        Each sprint should have specific, concrete tasks that are:
        - Appropriate for the sprint's place in the project timeline
        - Realistic in scope given the team size
        - Specific to the technologies being used
        - Following a logical progression

        Return your sprint breakdown as a JSON object where:
        - Keys are "Sprint 1", "Sprint 2", etc.
        - Values are arrays of task names for that sprint

        For example:
        {{
          "Sprint 1": ["Set up development environment", "Create database schema", ...],
          "Sprint 2": ["Implement user authentication", "Create API endpoints", ...],
          ...
        }}
        """

        try:
            sprint_response = OpenAIService.generate_completion(prompt, temperature=0.4)
            sprint_data = json.loads(sprint_response)
            return sprint_data
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error generating sprint breakdown with OpenAI: {e}")
            # Return empty dict for fallback
            return {}

    @staticmethod
    def generate_team_composition(project_details):
        """
        Generate optimal team composition based on project requirements.
        Suggests roles and required skills based on project parameters.

        Args:
            project_details: Dictionary of project details.

        Returns:
            list: Required roles and skills for the project.
        """
        prompt = f"""
        As a Technical Staffing expert, recommend the optimal team composition for this project:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Technologies: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Generate a detailed team composition with exactly {project_details.get('project_team_size', 'N/A')} roles that includes:
        1. Specific role titles appropriate for the project
        2. Required technical skills for each role
        3. A mix of roles appropriate for the project type and technology stack

        Each role should have:
        - A clear title (e.g., "Frontend Developer", "DevOps Engineer")
        - A comprehensive list of required skills, prioritizing the project's technologies
        - Skills that are specific and relevant, not generic

        Return your team composition as a JSON array of role objects, each with "role" and "skills" properties.
        For example: [{"role": "Frontend Developer", "skills": ["React", "JavaScript", "CSS"]}, ...]

        Ensure the total number of roles exactly matches the team size of {project_details.get('project_team_size', 'N/A')}.
        """

        try:
            team_response = OpenAIService.generate_completion(prompt, temperature=0.4)
            team_data = json.loads(team_response)
            return team_data
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error generating team composition with OpenAI: {e}")
            # Return empty list for fallback
            return []

    @staticmethod
    def analyze_project_progress(current_metrics, original_plan):
        """
        Analyze current project progress against the original plan.
        Provides insights for KPI adjustment and corrective actions.

        Args:
            current_metrics: Dictionary of current project metrics.
            original_plan: Dictionary of original project plan and KPIs.

        Returns:
            dict: Analysis of project progress with recommendations.
        """
        prompt = f"""
        As a Project Analysis expert, analyze the current project progress against the original plan:

        Original Plan:
        {json.dumps(original_plan, indent=2)}

        Current Metrics:
        {json.dumps(current_metrics, indent=2)}

        Provide a detailed analysis including:
        1. Overall project health assessment
        2. Areas performing better than expected
        3. Areas performing worse than expected
        4. Root causes of deviations
        5. Recommended adjustments to KPI targets
        6. Actionable recommendations for improvement

        Return your analysis as a structured JSON object with clear assessments and detailed recommendations.
        """

        try:
            analysis_response = OpenAIService.generate_completion(prompt, temperature=0.3, max_tokens=2000)
            analysis = json.loads(analysis_response)
            return analysis
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error analyzing project progress with OpenAI: {e}")
            # Return basic analysis for fallback
            return {
                "project_health": "Needs Attention",
                "recommendations": ["Review KPI targets", "Focus on underperforming areas"]
            }

    @staticmethod
    def generate_retrospective_insights(sprint_data, kpi_data):
        """
        Generate retrospective insights based on sprint and KPI data.
        Provides actionable insights for team improvement.

        Args:
            sprint_data: Dictionary of sprint performance data.
            kpi_data: Dictionary of current KPI metrics.

        Returns:
            dict: Retrospective insights with strengths, areas for improvement, and action items.
        """
        prompt = f"""
        As an Agile Coach, analyze the following sprint and KPI data to generate insights for a sprint retrospective:

        Sprint Performance:
        {json.dumps(sprint_data, indent=2)}

        KPI Metrics:
        {json.dumps(kpi_data, indent=2)}

        Generate a comprehensive retrospective analysis that includes:
        1. Key strengths demonstrated during the sprint
        2. Areas for improvement with specific examples
        3. Concrete action items for the next sprint
        4. KPI trends and their implications
        5. Recommended focus areas for the team

        Return your analysis as a structured JSON object with clear, actionable insights.
        """

        try:
            insights_response = OpenAIService.generate_completion(prompt, temperature=0.4, max_tokens=2000)
            insights = json.loads(insights_response)
            return insights
        except (json.JSONDecodeError, Exception) as e:
            print(f"Error generating retrospective insights with OpenAI: {e}")
            # Return basic insights for fallback
            return {
                "strengths": ["Team collaboration"],
                "improvements": ["Sprint planning accuracy"],
                "actions": ["Review estimation process"]
            }


# Singleton instance of OpenAI service
openai_service = OpenAIService()