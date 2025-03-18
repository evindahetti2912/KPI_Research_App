import os
import numpy as np
from services.pdf_service import pdf_service
from utils.file_utils import get_file_extension


class CVExtractor:
    """Class for extracting text from CVs in various formats."""

    @staticmethod
    def extract_text(file_path):
        """
        Extract text from a CV file based on its extension.

        Args:
            file_path: Path to the CV file.

        Returns:
            str: Extracted text from the CV.
        """
        try:
            # Get file extension
            extension = get_file_extension(file_path)

            # Process based on file type
            if extension in ['pdf']:
                return pdf_service.extract_text_from_pdf(file_path)
            elif extension in ['jpg', 'jpeg', 'png']:
                return pdf_service.extract_text_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file format: {extension}")
        except Exception as e:
            print(f"Error extracting CV text: {e}")
            raise

    @staticmethod
    def preprocess_text(text):
        """
        Preprocess the extracted text for better parsing.

        Args:
            text: The raw extracted text.

        Returns:
            str: Preprocessed text.
        """
        # Remove excessive newlines
        text = ' '.join([line.strip() for line in text.split('\n') if line.strip()])

        # Replace multiple spaces with a single space
        text = ' '.join(text.split())

        return text