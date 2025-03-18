import openai
from config import active_config

# Set the OpenAI API key
openai.api_key = active_config.OPENAI_API_KEY


class OpenAIService:
    """Service for OpenAI API operations."""

    @staticmethod
    def generate_completion(prompt, model=None, temperature=0.7, max_tokens=1500):
        """Generate a completion using OpenAI's ChatCompletion API."""
        try:
            response = openai.ChatCompletion.create(
                model=model or active_config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response["choices"][0]["message"]["content"].strip()
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
        """Generate KPIs for a project using OpenAI."""
        prompt = f"""
        Based on the following project details:
        - Project Type: {project_details.get('project_type', 'N/A')}
        - Project Timeline: {project_details.get('project_timeline', 'N/A')} days
        - Team Size: {project_details.get('project_team_size', 'N/A')}
        - Languages: {', '.join(project_details.get('project_languages', ['N/A']))}
        - Number of Sprints: {project_details.get('project_sprints', 'N/A')}

        Return the following details as a JSON object:
        {{
            "GanttChartDetails": [
                {{
                    "Task": "Task description",
                    "Start": "Day X",
                    "End": "Day Y"
                }}
            ],
            "EmployeeCriteria": [
                {{
                    "role": "Role of the employee",
                    "skills": ["List of required skills"]
                }}
            ],
            "SprintBreakdown": {{
                "Sprint 1": ["List of tasks for Sprint 1"],
                "Sprint 2": ["List of tasks for Sprint 2"],
                "Sprint 3": ["List of tasks for Sprint 3"],
                "Sprint 4": ["List of tasks for Sprint 4"],
                "Sprint 5": ["List of tasks for Sprint 5"]
            }}
        }}
        """
        return OpenAIService.generate_completion(prompt, temperature=0.7)

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
        they could use to acquire these skills.
        """
        return OpenAIService.generate_completion(prompt, temperature=0.7)


# Singleton instance of OpenAI service
openai_service = OpenAIService()