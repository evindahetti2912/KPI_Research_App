class RoleHierarchy:
    """
    Class for managing job role hierarchies and progression paths.
    """

    # Default role hierarchy for software development
    DEFAULT_HIERARCHY = {
        "Software Engineer": {
            "level": 1,
            "required_skills": {
                "technical": [
                    {"name": "Programming Fundamentals", "min_proficiency": 3},
                    {"name": "Data Structures", "min_proficiency": 3},
                    {"name": "Algorithms", "min_proficiency": 2},
                    {"name": "Version Control", "min_proficiency": 3},
                    {"name": "Testing", "min_proficiency": 2}
                ],
                "soft": [
                    {"name": "Communication", "min_proficiency": 2},
                    {"name": "Problem-solving", "min_proficiency": 3},
                    {"name": "Teamwork", "min_proficiency": 2}
                ]
            },
            "min_experience": 0,
            "next_role": "Senior Software Engineer"
        },
        "Senior Software Engineer": {
            "level": 2,
            "required_skills": {
                "technical": [
                    {"name": "Advanced Programming", "min_proficiency": 4},
                    {"name": "Architecture Design", "min_proficiency": 3},
                    {"name": "Performance Optimization", "min_proficiency": 3},
                    {"name": "Code Review", "min_proficiency": 4},
                    {"name": "CI/CD", "min_proficiency": 3}
                ],
                "soft": [
                    {"name": "Leadership", "min_proficiency": 3},
                    {"name": "Mentoring", "min_proficiency": 3},
                    {"name": "Communication", "min_proficiency": 3},
                    {"name": "Problem-solving", "min_proficiency": 4}
                ]
            },
            "min_experience": 3,
            "next_role": "Lead Software Engineer"
        },
        "Lead Software Engineer": {
            "level": 3,
            "required_skills": {
                "technical": [
                    {"name": "System Design", "min_proficiency": 4},
                    {"name": "Architecture Patterns", "min_proficiency": 4},
                    {"name": "Technical Leadership", "min_proficiency": 4},
                    {"name": "Project Planning", "min_proficiency": 3},
                    {"name": "Cross-functional Collaboration", "min_proficiency": 3}
                ],
                "soft": [
                    {"name": "Team Leadership", "min_proficiency": 4},
                    {"name": "Strategic Thinking", "min_proficiency": 3},
                    {"name": "Stakeholder Management", "min_proficiency": 3},
                    {"name": "Decision Making", "min_proficiency": 4}
                ]
            },
            "min_experience": 5,
            "next_role": "Software Architect"
        },
        "Software Architect": {
            "level": 4,
            "required_skills": {
                "technical": [
                    {"name": "Enterprise Architecture", "min_proficiency": 4},
                    {"name": "Scalability Design", "min_proficiency": 4},
                    {"name": "Security Architecture", "min_proficiency": 3},
                    {"name": "Technology Strategy", "min_proficiency": 4},
                    {"name": "Cross-platform Integration", "min_proficiency": 4}
                ],
                "soft": [
                    {"name": "Strategic Vision", "min_proficiency": 4},
                    {"name": "Executive Communication", "min_proficiency": 4},
                    {"name": "Team Leadership", "min_proficiency": 4},
                    {"name": "Change Management", "min_proficiency": 3}
                ]
            },
            "min_experience": 8,
            "next_role": "CTO/CIO"
        }
    }

    @staticmethod
    def get_role_hierarchy(role_name=None):
        """
        Get the role hierarchy for a given role name or the complete hierarchy.

        Args:
            role_name: Optional name of the role to retrieve.

        Returns:
            dict: Role hierarchy data.
        """
        if role_name:
            return RoleHierarchy.DEFAULT_HIERARCHY.get(role_name, {})
        else:
            return RoleHierarchy.DEFAULT_HIERARCHY

    @staticmethod
    def get_next_role(role_name):
        """
        Get the next role in the hierarchy for a given role.

        Args:
            role_name: Name of the current role.

        Returns:
            str: Name of the next role or None if at the top.
        """
        role_data = RoleHierarchy.get_role_hierarchy(role_name)
        return role_data.get('next_role', None)

    @staticmethod
    def get_required_skills(role_name):
        """
        Get the required skills for a given role.

        Args:
            role_name: Name of the role.

        Returns:
            dict: Required technical and soft skills.
        """
        role_data = RoleHierarchy.get_role_hierarchy(role_name)
        return role_data.get('required_skills', {'technical': [], 'soft': []})

    @staticmethod
    def get_role_level(role_name):
        """
        Get the hierarchical level of a role.

        Args:
            role_name: Name of the role.

        Returns:
            int: Level number or 0 if not found.
        """
        role_data = RoleHierarchy.get_role_hierarchy(role_name)
        return role_data.get('level', 0)

    @staticmethod
    def get_min_experience(role_name):
        """
        Get the minimum years of experience required for a role.

        Args:
            role_name: Name of the role.

        Returns:
            int: Minimum years of experience or 0 if not found.
        """
        role_data = RoleHierarchy.get_role_hierarchy(role_name)
        return role_data.get('min_experience', 0)

    @staticmethod
    def find_matching_role(skills, experience_years):
        """
        Find the most appropriate role based on skills and experience.

        Args:
            skills: List of skills.
            experience_years: Years of experience.

        Returns:
            str: Name of the matching role.
        """
        # Convert skills to a set for faster lookups
        skills_set = set(skill.lower() for skill in skills)

        best_match = "Software Engineer"  # Default role
        best_match_score = 0

        for role_name, role_data in RoleHierarchy.DEFAULT_HIERARCHY.items():
            # Check if the person has enough experience for this role
            if experience_years < role_data.get('min_experience', 0):
                continue

            # Calculate skill match score
            required_skills = role_data.get('required_skills', {})
            tech_skills = required_skills.get('technical', [])
            soft_skills = required_skills.get('soft', [])

            all_required_skills = [skill['name'] for skill in tech_skills + soft_skills]

            # Count how many required skills the person has
            matching_skills = sum(1 for skill in all_required_skills if skill.lower() in skills_set)

            # Calculate match percentage
            if all_required_skills:
                match_score = matching_skills / len(all_required_skills)

                # If this role is a better match, update
                if match_score > best_match_score:
                    best_match_score = match_score
                    best_match = role_name

        return best_match