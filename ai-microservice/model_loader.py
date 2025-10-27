import os
import re
import pickle
import spacy
import numpy as np
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def load_models():
    """Load all models and components"""
    models = {}
    
    # Load spaCy model
    try:
        models['nlp'] = spacy.load('en_core_web_sm')
    except OSError:
        print("Warning: en_core_web_sm not found. Install with: python -m spacy download en_core_web_sm")
        models['nlp'] = None
    
    # Load classifier and vectorizer
    try:
        with open('models/classifier.pkl', 'rb') as f:
            models['clf'] = pickle.load(f)
        with open('models/vectorizer.pkl', 'rb') as f:
            models['vectorizer'] = pickle.load(f)
    except FileNotFoundError:
        print("Warning: Classifier models not found. Run train.py first.")
        models['clf'] = None
        models['vectorizer'] = None
    
    return models

def classify_category(text, vectorizer, clf, request_type=None):
    """Classify text into Network/Security/Cloud/General categories"""
    if not vectorizer or not clf:
        # Fallback to rule-based classification
        return _fallback_category_classification(text, request_type)
    
    # Use trained model
    text_features = vectorizer.transform([text])
    probabilities = clf.predict_proba(text_features)[0]
    predicted_class = clf.classes_[np.argmax(probabilities)]
    confidence = np.max(probabilities)
    
    return predicted_class, confidence

def _fallback_category_classification(text, request_type):
    """Rule-based fallback for category classification"""
    text_lower = text.lower()
    
    network_keywords = ['wifi', 'internet', 'connection', 'network', 'bandwidth', 'router', 'switch', 'vpn', 'dns']
    security_keywords = ['password', 'access', 'login', 'security', 'breach', 'virus', 'malware', 'authentication', 'firewall']
    cloud_keywords = ['cloud', 'backup', 'sync', 'storage', 'drive', 'aws', 'azure', 'google', 'dropbox', 'onedrive']
    
    network_score = sum(1 for kw in network_keywords if kw in text_lower)
    security_score = sum(1 for kw in security_keywords if kw in text_lower)
    cloud_score = sum(1 for kw in cloud_keywords if kw in text_lower)
    
    scores = {
        'Network': network_score,
        'Security': security_score,
        'Cloud': cloud_score,
        'General': 0
    }
    
    # Boost score if request_type matches
    if request_type in scores:
        scores[request_type] += 2
    
    max_category = max(scores, key=scores.get)
    max_score = scores[max_category]
    
    if max_score == 0:
        return 'General', 0.5
    
    confidence = min(0.9, 0.5 + (max_score / 10))
    return max_category, confidence

def extract_entities(text, nlp):
    """Extract entities using spaCy NER and custom rules"""
    entities = {"service": None, "device": None, "location": None, "other": []}
    
    if not nlp:
        # Fallback regex extraction
        return _fallback_entity_extraction(text)
    
    doc = nlp(text)
    
    # Extract entities from spaCy
    for ent in doc.ents:
        if ent.label_ in ['ORG', 'PRODUCT']:
            if not entities["service"]:
                entities["service"] = ent.text
        elif ent.label_ in ['GPE', 'LOC', 'FAC']:
            if not entities["location"]:
                entities["location"] = ent.text
        elif ent.label_ not in ['PERSON', 'DATE', 'TIME', 'MONEY', 'PERCENT']:
            entities["other"].append(ent.text)
    
    # Custom regex patterns for devices
    device_patterns = [
        r'\b(?:laptop|desktop|computer|pc|server|router|switch|printer|phone|tablet|iphone|android)\b',
        r'\b(?:model|serial)[\s#:]*([A-Z0-9\-]+)\b',
        r'\b[A-Z]{2,}\d{3,}\b'  # Device model patterns like HP123, DELL456
    ]
    
    for pattern in device_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches and not entities["device"]:
            entities["device"] = matches[0] if isinstance(matches[0], str) else matches[0][0]
            break
    
    # Clean up empty lists
    if not entities["other"]:
        entities.pop("other")
    
    return entities

def _fallback_entity_extraction(text):
    """Regex-based entity extraction fallback"""
    entities = {"service": None, "device": None, "location": None}
    
    # Service patterns
    service_patterns = [
        r'\b(?:office|outlook|teams|sharepoint|onedrive|dropbox|gmail|slack)\b',
        r'\b(?:windows|linux|macos|ubuntu|ios|android)\b'
    ]
    
    for pattern in service_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            entities["service"] = match.group()
            break
    
    # Device patterns
    device_patterns = [
        r'\b(?:laptop|desktop|computer|pc|server|router|switch|printer|phone)\b'
    ]
    
    for pattern in device_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            entities["device"] = match.group()
            break
    
    # Location patterns
    location_patterns = [
        r'\b(?:office|building|floor|room|conference|lobby|parking)\s*\w*\b',
        r'\b(?:headquarters|branch|site|location)\b'
    ]
    
    for pattern in location_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            entities["location"] = match.group().strip()
            break
    
    return entities

def detect_priority(text):
    """Detect priority based on keywords and sentiment"""
    text_lower = text.lower()
    
    # Urgency keywords with weights
    urgent_keywords = {
        'emergency': 3, 'critical': 3, 'urgent': 3, 'immediately': 3,
        'asap': 2, 'quickly': 2, 'fast': 2, 'soon': 2, 'important': 2,
        'down': 3, 'outage': 3, 'broken': 2, 'not working': 2, 'failed': 2,
        'problem': 1, 'issue': 1, 'help': 1
    }
    
    urgency_score = sum(weight for keyword, weight in urgent_keywords.items() if keyword in text_lower)
    
    # Sentiment analysis
    try:
        blob = TextBlob(text)
        sentiment_score = blob.sentiment.polarity
        # Negative sentiment increases urgency
        if sentiment_score < -0.1:
            urgency_score += 1
    except:
        sentiment_score = 0
    
    # Priority determination
    if urgency_score >= 5:
        priority = "Urgent"
        confidence = min(0.95, 0.7 + urgency_score * 0.05)
    elif urgency_score >= 3:
        priority = "High"
        confidence = min(0.9, 0.6 + urgency_score * 0.05)
    elif urgency_score >= 1:
        priority = "Medium"
        confidence = min(0.8, 0.5 + urgency_score * 0.05)
    else:
        priority = "Low"
        confidence = 0.6
    
    return priority, confidence

def summarize_text(text):
    """Create extractive summary"""
    if not text:
        return ""
    
    sentences = re.split(r'[.!?]+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    if not sentences:
        return text[:100] + "..." if len(text) > 100 else text
    
    # Take first 1-2 sentences, max 150 chars
    summary = sentences[0]
    if len(summary) < 80 and len(sentences) > 1:
        summary += ". " + sentences[1]
    
    if len(summary) > 150:
        summary = summary[:147] + "..."
    
    return summary