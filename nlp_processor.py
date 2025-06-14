# nlp_processor.py
import spacy
from collections import Counter
from typing import List, Dict
import re

nlp = spacy.load("ru_core_news_lg")

class TextProcessor:
    @staticmethod
    def extract_keywords(text: str, top_n: int = 10) -> List[str]:
        doc = nlp(text)
        keywords = [
            token.lemma_ for token in doc 
            if not token.is_stop and token.pos_ in ("NOUN", "PROPN")
        ]
        return [word for word, _ in Counter(keywords).most_common(top_n)]

    @staticmethod
    def split_into_sections(text: str) -> Dict[str, str]:
        sections = {}
        current_section = "Введение"
        for paragraph in text.split("\n\n"):
            if re.match(r"^#+\s", paragraph):  # Заголовки Markdown
                current_section = paragraph.strip("#").strip()
            sections[current_section] = sections.get(current_section, "") + paragraph + "\n\n"
        return sections
