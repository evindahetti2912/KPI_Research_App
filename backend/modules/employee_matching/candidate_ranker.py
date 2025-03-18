from modules.employee_matching.skill_matcher import SkillMatcher
from modules.employee_matching.experience_analyzer import ExperienceAnalyzer
from modules.employee_matching.fuzzy_matching import FuzzyMatcher


class CandidateRanker:
    """
    Class for ranking candidates based on their match to project requirements.
    """

    @staticmethod
    def rank_candidates(candidates, project_criteria, weights=None):
        """
        Rank candidates based on their match to project criteria.

        Args:
            candidates: List of candidate data.
            project_criteria: Dictionary of project requirements.
            weights: Dictionary of weights for different criteria.
                    Default is equal weighting.

        Returns:
            list: Sorted list of candidates with scores.
        """
        if not candidates or not project_criteria:
            return []

        # Default weights if not provided
        if not weights:
            weights = {
                "skill_match": 0.4,
                "experience_relevance": 0.3,
                "years_experience": 0.2,
                "project_type_match": 0.1
            }

        ranked_candidates = []

        for candidate in candidates:
            # Calculate various scores
            scores = CandidateRanker.calculate_candidate_scores(candidate, project_criteria)

            # Calculate weighted total score
            total_score = sum(weights.get(key, 0) * scores.get(key, 0) for key in weights)

            # Add candidate with scores to the result list
            ranked_candidates.append({
                "candidate": candidate,
                "scores": scores,
                "total_score": total_score
            })

        # Sort candidates by total score (descending)
        ranked_candidates.sort(key=lambda x: x["total_score"], reverse=True)

        return ranked_candidates

    @staticmethod
    def calculate_candidate_scores(candidate, project_criteria):
        """
        Calculate various scores for a candidate based on project criteria.

        Args:
            candidate: Candidate data.
            project_criteria: Dictionary of project requirements.

        Returns:
            dict: Dictionary of scores.
        """
        scores = {}

        # 1. Skill Match Score
        # Get skills from candidate and project
        candidate_skills = candidate.get("Skills", [])
        project_languages = project_criteria.get("languages", "").split(",") if isinstance(
            project_criteria.get("languages"), str) else project_criteria.get("languages", [])

        # Calculate skill match score
        skill_match = SkillMatcher.calculate_skill_similarity(candidate_skills, project_languages)
        scores["skill_match"] = skill_match

        # 2. Experience Relevance Score
        experience_items = candidate.get("Experience", [])
        field = project_criteria.get("field", "")

        # Check if candidate has relevant experience
        has_relevant_exp, best_match, best_score = ExperienceAnalyzer.has_relevant_experience(
            experience_items, field
        )

        # Normalize score to 0-1 range
        scores["experience_relevance"] = best_score / 100.0 if best_score else 0.0

        # 3. Years of Experience Score
        years_experience = ExperienceAnalyzer.get_years_of_experience(experience_items, field)

        # Normalize years of experience (assuming 10+ years is max)
        normalized_years = min(years_experience / 10.0, 1.0)
        scores["years_experience"] = normalized_years

        # 4. Project Type Match Score
        project_analysis = ExperienceAnalyzer.analyze_project_experience(experience_items)
        project_type = project_criteria.get("project_type", "")

        # If project type is specified, calculate match score
        if project_type and project_analysis["most_common_type"]:
            project_type_similarity = FuzzyMatcher.get_similarity(
                project_type, project_analysis["most_common_type"], method='token_set_ratio'
            ) / 100.0
            scores["project_type_match"] = project_type_similarity
        else:
            scores["project_type_match"] = 0.0

        return scores

    @staticmethod
    def select_best_candidates(ranked_candidates, count=1):
        """
        Select the top N candidates from the ranked list.

        Args:
            ranked_candidates: List of ranked candidates with scores.
            count: Number of candidates to select.

        Returns:
            list: List of top candidates.
        """
        if not ranked_candidates:
            return []

        # Select top N candidates
        top_candidates = ranked_candidates[:count]

        return top_candidates