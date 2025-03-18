class TrainingRecommender:
    """
    Class for recommending training resources based on skill gaps.
    """

    # Sample training resources database
    TRAINING_RESOURCES = {
        "Programming Fundamentals": [
            {
                "type": "Course",
                "name": "Introduction to Programming",
                "provider": "Coursera",
                "url": "https://www.coursera.org/learn/programming-fundamentals",
                "description": "Learn the basics of programming, including variables, loops, and functions."
            },
            {
                "type": "Book",
                "name": "Clean Code",
                "provider": "Robert C. Martin",
                "url": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882",
                "description": "A handbook of good programming practices."
            }
        ],
        "Data Structures": [
            {
                "type": "Course",
                "name": "Data Structures and Algorithms",
                "provider": "Udemy",
                "url": "https://www.udemy.com/course/data-structures-and-algorithms",
                "description": "Learn the most common data structures and algorithms."
            }
        ],
        "Algorithms": [
            {
                "type": "Course",
                "name": "Algorithms Specialization",
                "provider": "Coursera",
                "url": "https://www.coursera.org/specializations/algorithms",
                "description": "Master algorithmic techniques for solving problems."
            }
        ],
        "Version Control": [
            {
                "type": "Tutorial",
                "name": "Git and GitHub Tutorial",
                "provider": "Atlassian",
                "url": "https://www.atlassian.com/git/tutorials",
                "description": "Learn Git version control and GitHub collaboration."
            }
        ],
        "Testing": [
            {
                "type": "Course",
                "name": "Software Testing and Automation",
                "provider": "Udacity",
                "url": "https://www.udacity.com/course/software-testing--cs258",
                "description": "Learn the fundamentals of software testing."
            }
        ],
        "Advanced Programming": [
            {
                "type": "Course",
                "name": "Advanced Programming Techniques",
                "provider": "edX",
                "url": "https://www.edx.org/learn/advanced-programming",
                "description": "Master advanced programming concepts and techniques."
            }
        ],
        "Architecture Design": [
            {
                "type": "Course",
                "name": "Software Architecture & Design",
                "provider": "Udacity",
                "url": "https://www.udacity.com/course/software-architecture-design--ud821",
                "description": "Learn how to design and architect software systems."
            }
        ],
        "System Design": [
            {
                "type": "Book",
                "name": "System Design Interview",
                "provider": "Alex Xu",
                "url": "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119",
                "description": "A guide to system design concepts and practices."
            }
        ],
        "Communication": [
            {
                "type": "Course",
                "name": "Effective Communication Skills",
                "provider": "LinkedIn Learning",
                "url": "https://www.linkedin.com/learning/communication-foundations",
                "description": "Master the art of effective communication in the workplace."
            }
        ],
        "Leadership": [
            {
                "type": "Course",
                "name": "Leadership Development",
                "provider": "Harvard Business School Online",
                "url": "https://online.hbs.edu/courses/leadership-principles/",
                "description": "Develop essential leadership skills and principles."
            }
        ]
    }

    @staticmethod
    def get_resources_for_skill(skill_name):
        """
        Get training resources for a specific skill.

        Args:
            skill_name: Name of the skill.

        Returns:
            list: List of training resources.
        """
        # Check exact match
        if skill_name in TrainingRecommender.TRAINING_RESOURCES:
            return TrainingRecommender.TRAINING_RESOURCES[skill_name]

        # Try case-insensitive match
        for key, resources in TrainingRecommender.TRAINING_RESOURCES.items():
            if key.lower() == skill_name.lower():
                return resources

        # Try partial match
        skill_lower = skill_name.lower()
        for key, resources in TrainingRecommender.TRAINING_RESOURCES.items():
            if skill_lower in key.lower() or key.lower() in skill_lower:
                return resources

        # No match found
        return []

    @staticmethod
    def recommend_for_skill_gaps(skill_gaps):
        """
        Recommend training resources for a list of skill gaps.

        Args:
            skill_gaps: List of skill names or skill objects.

        Returns:
            dict: Recommendations by skill.
        """
        recommendations = {}

        for skill in skill_gaps:
            # Handle both string skills and skill objects
            if isinstance(skill, dict):
                skill_name = skill.get('name', '')
            else:
                skill_name = skill

            resources = TrainingRecommender.get_resources_for_skill(skill_name)

            if resources:
                recommendations[skill_name] = resources

        return recommendations

    @staticmethod
    def recommend_for_career_progression(progression_analysis):
        """
        Recommend training resources for career progression.

        Args:
            progression_analysis: Career progression analysis from SkillGapAnalyzer.

        Returns:
            dict: Recommendations by skill category.
        """
        if not progression_analysis:
            return {}

        # Get skill gaps from progression analysis
        skill_gaps = progression_analysis.get('skill_gaps', {})
        technical_gaps = skill_gaps.get('technical', [])
        soft_gaps = skill_gaps.get('soft', [])

        # Get recommendations for each category
        technical_recommendations = TrainingRecommender.recommend_for_skill_gaps(technical_gaps)
        soft_recommendations = TrainingRecommender.recommend_for_skill_gaps(soft_gaps)

        # Combine recommendations
        recommendations = {
            'technical': technical_recommendations,
            'soft': soft_recommendations,
            'next_role': progression_analysis.get('next_role', 'Unknown'),
            'readiness': progression_analysis.get('readiness', 0)
        }

        return recommendations

    @staticmethod
    def recommend_for_project(project_skill_gap_analysis):
        """
        Recommend training resources for project-specific skill gaps.

        Args:
            project_skill_gap_analysis: Project skill gap analysis from SkillGapAnalyzer.

        Returns:
            dict: Recommendations by skill.
        """
        if not project_skill_gap_analysis:
            return {}

        # Get missing skills from analysis
        missing_skills = project_skill_gap_analysis.get('missing_skills', [])

        # Get recommendations for missing skills
        recommendations = TrainingRecommender.recommend_for_skill_gaps(missing_skills)

        return recommendations