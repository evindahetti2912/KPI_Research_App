class SkillMatcher:
    """Class for matching employee skills to project requirements."""

    @staticmethod
    def calculate_skill_match(employee_skills, required_skills):
        """
        Calculate the skill match percentage between employee skills and required skills.
        Match even if employee has only some of the required skills.

        Args:
            employee_skills: List of employee skills.
            required_skills: List of required skills.

        Returns:
            tuple: (match_percentage, matched_skills, missing_skills)
        """
        if not employee_skills or not required_skills:
            return 0.0, [], required_skills

        # Convert all skills to lowercase for case-insensitive matching
        employee_skills_lower = [skill.lower() for skill in employee_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]

        # Find matched and missing skills
        matched_skills = []
        for req_skill in required_skills:
            req_skill_lower = req_skill.lower()

            # Check for exact match
            if req_skill_lower in employee_skills_lower:
                matched_skills.append(req_skill)
                continue

            # Check for partial match (e.g., "Python" matches "Python 3")
            found_partial = False
            for emp_skill in employee_skills:
                emp_skill_lower = emp_skill.lower()
                if req_skill_lower in emp_skill_lower or emp_skill_lower in req_skill_lower:
                    matched_skills.append(req_skill)
                    found_partial = True
                    break

            # If no match found, check for synonyms/related skills
            if not found_partial:
                for emp_skill, req_skill_pair in SkillMatcher.get_related_skills():
                    if (req_skill_lower == req_skill_pair.lower() and
                            emp_skill.lower() in employee_skills_lower):
                        matched_skills.append(req_skill)
                        break

        # Calculate missing skills
        missing_skills = [skill for skill in required_skills if skill not in matched_skills]

        # Calculate match percentage - now ensures a percentage even if only 1 skill matches
        match_percentage = len(matched_skills) / len(required_skills) if required_skills else 0.0

        # Return match data even for low match percentages
        return match_percentage, matched_skills, missing_skills

    @staticmethod
    def calculate_skill_compatibility(employee_skills, required_skills):
        """
        Calculate a more detailed compatibility score between employee skills and required skills.
        Provides a percentage rating even if only some skills match.

        Args:
            employee_skills: List of employee skills.
            required_skills: List of required skills.

        Returns:
            dict: Compatibility details including percentage and breakdown
        """
        if not employee_skills or not required_skills:
            return {
                "compatibility_percentage": 0.0,
                "matched_skills": [],
                "missing_skills": required_skills.copy() if required_skills else [],
                "partial_matches": {},
                "has_match": False,
                "skill_coverage": 0.0
            }

        # Basic match calculation
        match_percentage, matched_skills, missing_skills = SkillMatcher.calculate_skill_match(
            employee_skills, required_skills
        )

        # Calculate partial matches for missing skills
        partial_matches = {}
        for missing_skill in missing_skills.copy():
            missing_skill_lower = missing_skill.lower()
            best_partial_match = None
            best_partial_score = 0

            # Look for partial matches among employee skills
            for emp_skill in employee_skills:
                emp_skill_lower = emp_skill.lower()

                # Check for word overlap
                missing_words = set(missing_skill_lower.split())
                emp_words = set(emp_skill_lower.split())
                common_words = missing_words.intersection(emp_words)

                if common_words:
                    similarity = len(common_words) / len(missing_words)
                    if similarity > best_partial_score:
                        best_partial_score = similarity
                        best_partial_match = emp_skill

            # If good partial match found
            if best_partial_match and best_partial_score > 0.5:
                partial_matches[missing_skill] = {
                    "matched_skill": best_partial_match,
                    "similarity": best_partial_score
                }

        # Adjust compatibility score to account for partial matches
        adjusted_score = match_percentage
        if missing_skills and partial_matches:
            # Add a smaller weight for partial matches
            partial_match_weight = sum(match["similarity"] for match in partial_matches.values()) * 0.5
            adjusted_score = match_percentage + (partial_match_weight / len(required_skills))

        # Get weighted skill coverage
        skill_coverage = len(matched_skills) / len(required_skills) if required_skills else 0.0

        return {
            "compatibility_percentage": round(adjusted_score * 100, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "partial_matches": partial_matches,
            "has_match": bool(matched_skills or partial_matches),
            "skill_coverage": round(skill_coverage * 100, 1)
        }