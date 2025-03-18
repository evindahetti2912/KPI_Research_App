import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SkillMatcher:
    """
    Class for matching employee skills to project requirements.
    """

    @staticmethod
    def preprocess_skills(skills_list):
        """
        Preprocess a list of skills for TF-IDF vectorization.

        Args:
            skills_list: List of skill strings.

        Returns:
            str: Space-separated string of skills.
        """
        if not skills_list:
            return ""

        # Convert to list if it's not already
        if not isinstance(skills_list, list):
            if isinstance(skills_list, str):
                return skills_list.lower()
            else:
                return ""

        # Convert to lowercase and join with spaces
        return " ".join([skill.lower() for skill in skills_list])

    @staticmethod
    def calculate_skill_similarity(employee_skills, project_skills):
        """
        Calculate the similarity between employee skills and project requirements.

        Args:
            employee_skills: List of employee skills.
            project_skills: List of required project skills.

        Returns:
            float: Similarity score (0-1).
        """
        if not employee_skills or not project_skills:
            return 0.0

        # Preprocess skills
        emp_skills_str = SkillMatcher.preprocess_skills(employee_skills)
        proj_skills_str = SkillMatcher.preprocess_skills(project_skills)

        if not emp_skills_str or not proj_skills_str:
            return 0.0

        # Create corpus for TF-IDF
        corpus = [emp_skills_str, proj_skills_str]

        # Initialize TF-IDF vectorizer
        vectorizer = TfidfVectorizer()

        try:
            # Transform corpus to TF-IDF features
            tfidf_matrix = vectorizer.fit_transform(corpus)

            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

            return similarity
        except Exception as e:
            print(f"Error calculating skill similarity: {e}")
            return 0.0

    @staticmethod
    def get_skill_gap(employee_skills, project_skills):
        """
        Identify skills that the project requires but the employee lacks.

        Args:
            employee_skills: List of employee skills.
            project_skills: List of required project skills.

        Returns:
            list: List of missing skills.
        """
        if not employee_skills or not project_skills:
            return project_skills or []

        # Convert all to lowercase for case-insensitive comparison
        emp_skills_lower = [skill.lower() for skill in employee_skills]

        # Find missing skills
        missing_skills = []
        for skill in project_skills:
            skill_lower = skill.lower()

            # Check if the project skill exists in employee skills
            if not any(skill_lower in emp_skill for emp_skill in emp_skills_lower):
                missing_skills.append(skill)

        return missing_skills

    @staticmethod
    def get_skill_weightage(skills, important_skills):
        """
        Calculate weightage score based on important skills.

        Args:
            skills: List of skills to evaluate.
            important_skills: Dictionary of important skills with their weights.
                              E.g., {"Python": 0.8, "JavaScript": 0.6}

        Returns:
            float: Weighted score (0-1).
        """
        if not skills or not important_skills:
            return 0.0

        # Convert skills to lowercase for case-insensitive comparison
        skills_lower = [skill.lower() for skill in skills]

        total_weight = sum(important_skills.values())
        matched_weight = 0.0

        # Calculate matched weight
        for skill, weight in important_skills.items():
            skill_lower = skill.lower()
            if any(skill_lower in s for s in skills_lower):
                matched_weight += weight

        # Calculate weighted score
        if total_weight == 0:
            return 0.0

        return matched_weight / total_weight