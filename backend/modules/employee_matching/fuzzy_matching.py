from fuzzywuzzy import fuzz, process


class FuzzyMatcher:
    """
    Class for performing fuzzy string matching and similarity calculations.
    """

    @staticmethod
    def get_similarity(str1, str2, method='partial_ratio'):
        """
        Get similarity score between two strings.

        Args:
            str1: First string.
            str2: Second string.
            method: Matching method ('ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio').
                   Default is 'partial_ratio'.

        Returns:
            int: Similarity score (0-100).
        """
        if not str1 or not str2:
            return 0

        str1 = str(str1).lower()
        str2 = str(str2).lower()

        if method == 'ratio':
            return fuzz.ratio(str1, str2)
        elif method == 'partial_ratio':
            return fuzz.partial_ratio(str1, str2)
        elif method == 'token_sort_ratio':
            return fuzz.token_sort_ratio(str1, str2)
        elif method == 'token_set_ratio':
            return fuzz.token_set_ratio(str1, str2)
        else:
            return fuzz.partial_ratio(str1, str2)  # Default to partial_ratio

    @staticmethod
    def find_best_match(query, choices, method='partial_ratio', threshold=70):
        """
        Find the best match for a query in a list of choices.

        Args:
            query: The string to match.
            choices: List of possible choices.
            method: Matching method ('ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio').
            threshold: Minimum similarity score to consider a match (0-100).

        Returns:
            tuple: (best_match, score) or (None, 0) if no match found.
        """
        if not query or not choices:
            return None, 0

        query = str(query).lower()

        # Select the appropriate fuzz function
        if method == 'ratio':
            scorer = fuzz.ratio
        elif method == 'partial_ratio':
            scorer = fuzz.partial_ratio
        elif method == 'token_sort_ratio':
            scorer = fuzz.token_sort_ratio
        elif method == 'token_set_ratio':
            scorer = fuzz.token_set_ratio
        else:
            scorer = fuzz.partial_ratio  # Default to partial_ratio

        # Find the best match
        best_match, score = process.extractOne(query, choices, scorer=scorer)

        # Return the match only if it meets the threshold
        if score >= threshold:
            return best_match, score
        else:
            return None, 0

    @staticmethod
    def filter_matches(query, choices, method='partial_ratio', threshold=70):
        """
        Filter a list of choices based on similarity to a query.

        Args:
            query: The string to match.
            choices: List of possible choices.
            method: Matching method ('ratio', 'partial_ratio', 'token_sort_ratio', 'token_set_ratio').
            threshold: Minimum similarity score to consider a match (0-100).

        Returns:
            list: List of tuples (match, score) for matches above threshold.
        """
        if not query or not choices:
            return []

        query = str(query).lower()

        # Select the appropriate fuzz function
        if method == 'ratio':
            scorer = fuzz.ratio
        elif method == 'partial_ratio':
            scorer = fuzz.partial_ratio
        elif method == 'token_sort_ratio':
            scorer = fuzz.token_sort_ratio
        elif method == 'token_set_ratio':
            scorer = fuzz.token_set_ratio
        else:
            scorer = fuzz.partial_ratio  # Default to partial_ratio

        # Find all matches above threshold
        matches = process.extract(query, choices, scorer=scorer)
        return [(match, score) for match, score in matches if score >= threshold]