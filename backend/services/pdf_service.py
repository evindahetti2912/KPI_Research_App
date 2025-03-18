import os

import numpy as np
from PIL import Image
import pytesseract
import fitz  # PyMuPDF
import io
import easyocr
from config import active_config


class PDFService:
    """Service for handling PDF files and extracting text."""

    def __init__(self):
        """Initialize the PDF service."""
        self.reader = easyocr.Reader(['en'])

    def extract_text_from_pdf(self, pdf_path):
        """
        Extract text from a PDF file.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            str: Extracted text.
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""

            for page_num in range(len(doc)):
                page = doc[page_num]
                text += page.get_text()

            # Check if PDF has meaningful text content
            if len(text.strip()) < 100:  # If text extraction yields little content, try OCR
                return self.extract_text_from_pdf_using_ocr(pdf_path)

            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def extract_text_from_pdf_using_ocr(self, pdf_path):
        """
        Extract text from a PDF file using OCR.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            str: Extracted text.
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""

            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap(matrix=fitz.Matrix(300 / 72, 300 / 72))
                img = Image.open(io.BytesIO(pix.tobytes("png")))

                # Use EasyOCR for better text recognition
                results = self.reader.readtext(np.array(img), detail=0, paragraph=True)
                page_text = "\n".join(results)
                text += page_text + "\n\n"

            return text
        except Exception as e:
            print(f"Error extracting text from PDF using OCR: {e}")
            return ""

    def extract_text_from_image(self, image_path):
        """
        Extract text from an image file using OCR.

        Args:
            image_path: Path to the image file.

        Returns:
            str: Extracted text.
        """
        try:
            results = self.reader.readtext(image_path, detail=0, paragraph=True)
            return "\n".join(results)
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return ""


# Singleton instance of PDF service
pdf_service = PDFService()