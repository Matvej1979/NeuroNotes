# pdf_generator.py
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate
import os

class PDFGenerator:
    @staticmethod
    def generate_pdf(text: str, output_path: str, theme: str = "light"):
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Добавление заголовка
        title_style = styles["Heading1"]
        story.append(Paragraph("Конспект лекции", title_style))
        
        # Добавление текста
        for line in text.split("\n"):
            story.append(Paragraph(line, styles["Normal"]))
        
        doc.build(story)
        return output_path
