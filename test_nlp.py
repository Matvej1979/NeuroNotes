# test_nlp.py
def test_keyword_extraction():
    processor = TextProcessor()
    keywords = processor.extract_keywords("Машинное обучение — это наука о данных")
    assert "обучение" in keywords
