from modules.skill_recommendation.role_hierarchy import RoleHierarchy
from modules.employee_matching.skill_matcher import SkillMatcher


class SkillGapAnalyzer:
    """
    Class for analyzing skill gaps between employee skills and required skills.
    """

    @staticmethod
    def analyze_role_skill_gap(employee_skills, role_name):
        """
        Analyze the gap between an employee's skills and those required for a specific role.

        Args:
            employee_skills: List of employee skills.
            role_name: Name of the role to analyze against.

        Returns:
            dict: Analysis of skill gaps.
        """
        if not employee_skills:
            employee_skills = []

        # Get required skills for the role
        required_skills = RoleHierarchy.get_required_skills(role_name)

        # Convert employee skills to lowercase for case-insensitive comparison
        employee_skills_lower = [skill.lower() for skill in employee_skills]

        # Analyze technical skills
        tech_skills = required_skills.get('technical', [])
        tech_gaps = []
        tech_matches = []

        for skill_item in tech_skills:
            skill_name = skill_item['name']
            min_proficiency = skill_item['min_proficiency']

            # Check if the employee has this skill
            if any(skill_name.lower() in emp_skill for emp_skill in employee_skills_lower):
                tech_matches.append({
                    'name': skill_name,
                    'required_proficiency': min_proficiency
                })
            else:
                tech_gaps.append({
                    'name': skill_name,
                    'required_proficiency': min_proficiency
                })

        # Analyze soft skills
        soft_skills = required_skills.get('soft', [])
        soft_gaps = []
        soft_matches = []

        for skill_item in soft_skills:
            skill_name = skill_item['name']
            min_proficiency = skill_item['min_proficiency']

            # Check if the employee has this skill
            if any(skill_name.lower() in emp_skill for emp_skill in employee_skills_lower):
                soft_matches.append({
                    'name': skill_name,
                    'required_proficiency': min_proficiency
                })
            else:
                soft_gaps.append({
                    'name': skill_name,
                    'required_proficiency': min_proficiency
                })

        # Calculate coverage percentages
        tech_coverage = len(tech_matches) / len(tech_skills) if tech_skills else 1.0
        soft_coverage = len(soft_matches) / len(soft_skills) if soft_skills else 1.0
        overall_coverage = (len(tech_matches) + len(soft_matches)) / (len(tech_skills) + len(soft_skills)) if (
                    tech_skills or soft_skills) else 1.0

        # Prepare analysis result
        analysis = {
            'role': role_name,
            'technical': {
                'gaps': tech_gaps,
                'matches': tech_matches,
                'coverage': tech_coverage
            },
            'soft': {
                'gaps': soft_gaps,
                'matches': soft_matches,
                'coverage': soft_coverage
            },
            'overall_coverage': overall_coverage,
            'is_qualified': overall_coverage >= 0.7  # Consider qualified if 70% coverage
        }

        return analysis

    @staticmethod
    def analyze_project_skill_gap(employee_skills, project_skills):
        """
        Analyze the gap between an employee's skills and those required for a project.

        Args:
            employee_skills: List of employee skills.
            project_skills: List of required project skills.

        Returns:
            dict: Analysis of skill gaps.
        """
        if not employee_skills:
            employee_skills = []

        if not project_skills:
            project_skills = []

        # Get missing skills
        missing_skills = SkillMatcher.get_skill_gap(employee_skills, project_skills)

        # Calculate similarity
        similarity = SkillMatcher.calculate_skill_similarity(employee_skills, project_skills)

        # Prepare analysis result
        analysis = {
            'missing_skills': missing_skills,
            'matching_skills': [skill for skill in project_skills if skill not in missing_skills],
            'similarity': similarity,
            'is_qualified': similarity >= 0.7  # Consider qualified if 70% similarity
        }

        return analysis

    @staticmethod
    def analyze_career_progression(employee_skills, current_role, experience_years):
        """
        Analyze an employee's readiness for career progression.

        Args:
            employee_skills: List of employee skills.
            current_role: Current role of the employee.
            experience_years: Years of experience.

        Returns:
            dict: Career progression analysis.
        """
        if not employee_skills:
            employee_skills = []

        # Get current role data
        current_role_data = RoleHierarchy.get_role_hierarchy(current_role)
        if not current_role_data:
            # If current role not found in hierarchy, find the best match
            current_role = RoleHierarchy.find_matching_role(employee_skills, experience_years)
            current_role_data = RoleHierarchy.get_role_hierarchy(current_role)

        # Get next role
        next_role = current_role_data.get('next_role', None)

        if not next_role:
            # At the top of the hierarchy
            return {
                'current_role': current_role,
                'next_role': None,
                'is_at_top': True,
                'readiness': 1.0,
                'skill_gaps': []
            }

        # Analyze skill gap for next role
        next_role_analysis = SkillGapAnalyzer.analyze_role_skill_gap(employee_skills, next_role)

        # Check experience requirements
        next_role_min_exp = RoleHierarchy.get_min_experience(next_role)
        experience_gap = max(0, next_role_min_exp - experience_years)

        # Calculate overall readiness (weighted average of skill coverage and experience)
        skill_readiness = next_role_analysis['overall_coverage']
        exp_readiness = 1.0 if experience_gap == 0 else min(1.0, experience_years / next_role_min_exp)

        # Weight skill coverage more heavily (70%) than experience (30%)
        overall_readiness = (skill_readiness * 0.7) + (exp_readiness * 0.3)

        # Prepare progression analysis
        tech_gaps = next_role_analysis['technical']['gaps']
        soft_gaps = next_role_analysis['soft']['gaps']

        progression_analysis = {
            'current_role': current_role,
            'next_role': next_role,
            'is_at_top': False,
            'readiness': overall_readiness,
            'skill_readiness': skill_readiness,
            'experience_readiness': exp_readiness,
            'experience_gap': experience_gap,
            'skill_gaps': {
                'technical': tech_gaps,
                'soft': soft_gaps
            },
            'is_ready': overall_readiness >= 0.8  # Ready if 80% ready
        }

        return progression_analysis