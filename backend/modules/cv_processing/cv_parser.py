import json
from services.openai_service import openai_service
from modules.cv_processing.cv_extractor import CVExtractor


class CVParser:
    """Class for parsing CV text into structured data."""

    @staticmethod
    def parse_cv(file_path):
        """
        Extract and parse a CV from a file path.

        Args:
            file_path: Path to the CV file.

        Returns:
            dict: Structured CV data.
        """
        try:
            # Extract text from CV
            extracted_text = CVExtractor.extract_text(file_path)

            # Preprocess the extracted text
            preprocessed_text = CVExtractor.preprocess_text(extracted_text)

            # Parse the text using OpenAI
            parsed_data_str = openai_service.parse_cv_data(preprocessed_text)

            # Convert the string response to a dictionary
            try:
                parsed_data = json.loads(parsed_data_str)
            except json.JSONDecodeError:
                raise ValueError("Failed to parse OpenAI response as JSON")

            # Add the original file path and raw text for reference
            parsed_data['_meta'] = {
                'source_file': file_path,
                'raw_text_length': len(extracted_text)
            }

            return parsed_data
        except Exception as e:
            print(f"Error parsing CV: {e}")
            raise

    @staticmethod
    def enhance_parsed_data(parsed_data):
        """
        Enhance the parsed CV data with additional derived information.

        Args:
            parsed_data: The parsed CV data.

        Returns:
            dict: Enhanced CV data.
        """
        enhanced_data = parsed_data.copy()

        # Add derived fields

        # Calculate total years of experience
        if 'Experience' in enhanced_data and isinstance(enhanced_data['Experience'], list):
            total_experience = 0
            for exp in enhanced_data['Experience']:
                if 'Duration' in exp and '-' in exp['Duration']:
                    try:
                        start, end = exp['Duration'].split('-')

                        # Handle "Present" or current positions
                        end = end.lower().replace('present', '2023').strip()
                        start = start.strip()

                        # Extract years
                        if len(start) >= 4 and len(end) >= 4:
                            start_year = int(start[-4:])
                            end_year = int(end[-4:])
                            duration = end_year - start_year
                            total_experience += duration
                    except Exception:
                        # If we can't parse the duration, just continue
                        continue

            enhanced_data['_derived'] = enhanced_data.get('_derived', {})
            enhanced_data['_derived']['total_years_experience'] = total_experience

        # Extract primary skills category
        if 'Skills' in enhanced_data and isinstance(enhanced_data['Skills'], list):
            # Group skills into categories (this is a simple example, can be more sophisticated)
            programming_keywords = ['python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php']
            framework_keywords = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'laravel']
            database_keywords = ['sql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'nosql']

            skills_categories = {
                'programming': [],
                'frameworks': [],
                'databases': [],
                'other': []
            }

            for skill in enhanced_data['Skills']:
                skill_lower = skill.lower()
                if any(keyword in skill_lower for keyword in programming_keywords):
                    skills_categories['programming'].append(skill)
                elif any(keyword in skill_lower for keyword in framework_keywords):
                    skills_categories['frameworks'].append(skill)
                elif any(keyword in skill_lower for keyword in database_keywords):
                    skills_categories['databases'].append(skill)
                else:
                    skills_categories['other'].append(skill)

            enhanced_data['_derived'] = enhanced_data.get('_derived', {})
            enhanced_data['_derived']['skill_categories'] = skills_categories

        return enhanced_data