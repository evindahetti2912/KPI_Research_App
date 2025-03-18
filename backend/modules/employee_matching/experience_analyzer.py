from modules.employee_matching.fuzzy_matching import FuzzyMatcher


class ExperienceAnalyzer:
    """
    Class for analyzing employee experience and matching to project requirements.
    """

    @staticmethod
    def has_relevant_experience(experience_items, field, min_similarity=70):
        """
        Check if an employee has experience relevant to a given field.

        Args:
            experience_items: List of experience items from employee data.
            field: The field to match against (e.g., "Software Engineer").
            min_similarity: Minimum similarity threshold (0-100).

        Returns:
            tuple: (has_relevant_exp, best_match, best_score)
        """
        if not experience_items or not field:
            return False, None, 0

        best_match = None
        best_score = 0

        # Extract roles from experience items
        for exp in experience_items:
            role = exp.get("Role", "")

            # Check similarity of role to the target field
            similarity = FuzzyMatcher.get_similarity(field, role, method='token_set_ratio')

            # Track the best match
            if similarity > best_score:
                best_score = similarity
                best_match = exp

        # Determine if the best match is good enough
        has_relevant_exp = best_score >= min_similarity

        return has_relevant_exp, best_match, best_score

    @staticmethod
    def get_years_of_experience(experience_items, field=None, min_similarity=70):
        """
        Calculate the years of experience, optionally filtered by a specific field.

        Args:
            experience_items: List of experience items from employee data.
            field: The field to filter by (optional).
            min_similarity: Minimum similarity threshold for field matching (0-100).

        Returns:
            float: Years of experience.
        """
        if not experience_items:
            return 0.0

        total_years = 0.0

        for exp in experience_items:
            # If a field is specified, check if this experience is relevant
            if field:
                similarity = FuzzyMatcher.get_similarity(field, exp.get("Role", ""), method='token_set_ratio')
                if similarity < min_similarity:
                    continue

            # Try to calculate duration from the Duration field
            duration = exp.get("Duration", "")
            if duration and '-' in duration:
                try:
                    start, end = duration.split('-')

                    # Handle "Present" or current positions
                    end = end.lower().replace('present', '2023').strip()
                    start = start.strip()

                    # Extract years
                    if len(start) >= 4 and len(end) >= 4:
                        start_year = int(start[-4:])
                        end_year = int(end[-4:])
                        years = end_year - start_year

                        # Don't count negative durations
                        if years > 0:
                            total_years += years
                except Exception:
                    # If we can't parse the duration, just continue
                    continue

        return total_years

    @staticmethod
    def get_experience_level(years_experience):
        """
        Determine experience level based on years of experience.

        Args:
            years_experience: Number of years of experience.

        Returns:
            str: Experience level ("Junior", "Mid-level", "Senior", "Lead").
        """
        if years_experience < 2:
            return "Junior"
        elif years_experience < 5:
            return "Mid-level"
        elif years_experience < 8:
            return "Senior"
        else:
            return "Lead"

    @staticmethod
    def analyze_project_experience(experience_items):
        """
        Analyze project types from experience to identify what project types the employee has worked on.

        Args:
            experience_items: List of experience items from employee data.

        Returns:
            dict: Project type analysis results.
        """
        # Project type keywords
        project_types = {
            "Web Development": ["web", "frontend", "backend", "full stack", "website", "web application"],
            "Mobile Development": ["mobile", "android", "ios", "app development", "mobile application"],
            "Data Science": ["data science", "machine learning", "data analysis", "big data", "analytics"],
            "Cloud": ["cloud", "aws", "azure", "gcp", "devops", "infrastructure"],
            "Enterprise": ["enterprise", "erp", "crm", "business application", "saas"]
        }

        # Initialize project type counts
        project_experience = {project_type: 0 for project_type in project_types}

        # Go through each experience item
        for exp in experience_items:
            role = exp.get("Role", "").lower()
            responsibilities = [r.lower() for r in exp.get("Responsibilities", [])]
            company = exp.get("Company", "").lower()

            # Combine all text for analysis
            all_text = " ".join([role] + responsibilities + [company])

            # Count project types found in the experience
            for project_type, keywords in project_types.items():
                for keyword in keywords:
                    if keyword in all_text:
                        project_experience[project_type] += 1
                        break  # Count each project type only once per experience

        # Calculate the most common project type
        most_common_type = max(project_experience.items(), key=lambda x: x[1])[0] if any(
            project_experience.values()) else None

        return {
            "project_type_counts": project_experience,
            "most_common_type": most_common_type
        }