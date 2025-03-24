import json
from services.openai_service import openai_service
from modules.kpi_generation.kpi_generator import KPIGenerator


class IndividualKPIGenerator:
    """
    Class for generating specialized KPIs for individual team members or roles,
    based on the project's overall KPIs and the specific skills and experience required.
    """

    @staticmethod
    def generate_individual_kpis(project_kpis, role_criteria, employee=None):
        """
        Generate specialized KPIs for a specific role or team member.

        Args:
            project_kpis: The overall project KPIs
            role_criteria: The skills and requirements for the role
            employee: Optional employee data if available

        Returns:
            dict: Specialized KPIs for the role or employee
        """
        # Always use LLM for specialized KPI generation
        try:
            # Prepare data for the prompt
            role_name = role_criteria.get("role", "Team Member")
            role_skills = role_criteria.get("skills", [])

            # Employee information if available
            employee_info = ""
            if employee:
                employee_info = f"""
                Employee Information:
                - Name: {employee.get('Name', 'Unknown')}
                - Skills: {', '.join(employee.get('Skills', []))}
                - Experience: {len(employee.get('Experience', []))} roles
                """

            # Create a prompt for OpenAI to generate specialized KPIs
            prompt = f"""
            You are a specialized KPI generator for software development teams. Given the overall project KPIs and the specific role requirements, 
            your task is to create specialized KPIs for a team member with the role of {role_name}.

            Overall Project KPIs:
            {json.dumps(project_kpis, indent=2)}

            Role Information:
            - Role Name: {role_name}
            - Required Skills: {', '.join(role_skills)}
            {employee_info}

            Based on this information, generate specialized KPIs for this role that:
            1. Align with the project's overall KPIs
            2. Are specifically relevant to the required skills and responsibilities of the role
            3. Consider the unique contribution this role makes to the project
            4. Are measurable and practical to track

            For each KPI category (productivity, code_quality, collaboration, adaptability), provide specific KPIs with:
            - value: the current expected value
            - target: the goal to reach
            - status: "On Track", "At Risk", or "Below Target"

            Return your response as a valid JSON object that follows the same structure as the overall project KPIs.
            """

            # Get KPI suggestions from OpenAI
            kpi_response = openai_service.generate_completion(prompt, temperature=0.3, max_tokens=2000)

            try:
                # Parse the JSON response
                individual_kpis = json.loads(kpi_response)
                return individual_kpis
            except (json.JSONDecodeError, TypeError):
                # Try to extract JSON if there's additional text before/after
                import re
                json_match = re.search(r'({[\s\S]*})', kpi_response)
                if json_match:
                    try:
                        individual_kpis = json.loads(json_match.group(1))
                        return individual_kpis
                    except:
                        pass

                # Fallback if parsing fails
                print("Failed to parse AI-generated individual KPIs, using derived method")
                return IndividualKPIGenerator._derive_individual_kpis(project_kpis, role_criteria, employee)

        except Exception as e:
            print(f"Error generating AI-based individual KPIs: {e}")
            # Fallback to derived method
            return IndividualKPIGenerator._derive_individual_kpis(project_kpis, role_criteria, employee)

    @staticmethod
    def _derive_individual_kpis(project_kpis, role_criteria, employee=None):
        """
        Derive individual KPIs from project KPIs when AI generation fails.

        Args:
            project_kpis: The overall project KPIs
            role_criteria: The skills and requirements for the role
            employee: Optional employee data

        Returns:
            dict: Derived individual KPIs
        """
        role_name = role_criteria.get("role", "Team Member")
        role_skills = role_criteria.get("skills", [])

        individual_kpis = {}

        # Copy the basic structure from project KPIs
        for category, kpi_items in project_kpis.items():
            individual_kpis[category] = {}

            for kpi_name, kpi_data in kpi_items.items():
                # Copy the KPI with some adjustments
                individual_kpis[category][kpi_name] = {
                    "value": kpi_data["value"],
                    "target": kpi_data["target"],
                    "status": kpi_data["status"]
                }

        # Customize based on role type
        role_lower = role_name.lower()

        # Frontend specific KPIs
        if any(tech in role_lower for tech in ["frontend", "ui", "ux"]):
            if "code_quality" in individual_kpis:
                individual_kpis["code_quality"]["ui_consistency"] = {
                    "value": "85%",
                    "target": "95%",
                    "status": "At Risk"
                }
            if "productivity" in individual_kpis:
                individual_kpis["productivity"]["component_reusability"] = {
                    "value": "70%",
                    "target": "80%",
                    "status": "At Risk"
                }

        # Backend specific KPIs
        elif any(tech in role_lower for tech in ["backend", "api", "server"]):
            if "code_quality" in individual_kpis:
                individual_kpis["code_quality"]["api_response_time"] = {
                    "value": "120ms",
                    "target": "100ms",
                    "status": "At Risk"
                }
            if "productivity" in individual_kpis:
                individual_kpis["productivity"]["endpoint_completion_rate"] = {
                    "value": "85%",
                    "target": "90%",
                    "status": "At Risk"
                }

        # DevOps specific KPIs
        elif any(tech in role_lower for tech in ["devops", "ops", "infrastructure"]):
            if "code_quality" in individual_kpis:
                individual_kpis["code_quality"]["deployment_success_rate"] = {
                    "value": "95%",
                    "target": "99%",
                    "status": "At Risk"
                }
            if "productivity" in individual_kpis:
                individual_kpis["productivity"]["environment_setup_time"] = {
                    "value": "4 hours",
                    "target": "2 hours",
                    "status": "Below Target"
                }

        return individual_kpis