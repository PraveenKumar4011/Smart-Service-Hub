#!/usr/bin/env python3
"""
Minimal AI Microservice for Smart Service Hub
Uses only built-in libraries for maximum compatibility
"""

from flask import Flask, request, jsonify
import os
import re
import json
from collections import Counter

app = Flask(__name__)

# Simple rule-based classification without external ML libraries
class SimpleTicketClassifier:
    def __init__(self):
        # Keywords for category classification
        self.category_keywords = {
            'Network': [
                'wifi', 'internet', 'connection', 'network', 'bandwidth', 
                'router', 'switch', 'vpn', 'dns', 'ethernet', 'ip', 
                'firewall', 'dhcp', 'wireless', 'cable'
            ],
            'Security': [
                'password', 'access', 'login', 'security', 'breach', 
                'virus', 'malware', 'authentication', 'firewall', 
                'permission', 'account', 'locked', 'credential'
            ],
            'Cloud': [
                'cloud', 'backup', 'sync', 'storage', 'drive', 'aws', 
                'azure', 'google', 'dropbox', 'onedrive', 'sharepoint',
                'office365', 'teams', 'salesforce'
            ],
            'General': [
                'printer', 'software', 'computer', 'monitor', 'keyboard',
                'mouse', 'application', 'excel', 'powerpoint', 'hardware'
            ]
        }
        
        # Priority keywords with weights
        self.priority_keywords = {
            'urgent': 3, 'critical': 3, 'emergency': 3, 'immediately': 3,
            'asap': 2, 'quickly': 2, 'fast': 2, 'soon': 2, 'important': 2,
            'down': 3, 'outage': 3, 'broken': 2, 'not working': 2, 
            'failed': 2, 'problem': 1, 'issue': 1, 'help': 1
        }

    def classify_category(self, text, request_type=None):
        """Classify text into categories"""
        text_lower = text.lower()
        scores = {}
        
        # Count keyword matches for each category
        for category, keywords in self.category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[category] = score
        
        # Boost score if request_type matches
        if request_type and request_type in scores:
            scores[request_type] += 2
        
        # Find best category
        max_category = max(scores, key=scores.get)
        max_score = scores[max_category]
        
        if max_score == 0:
            return 'General', 0.5
        
        confidence = min(0.95, 0.5 + (max_score / 10))
        return max_category, confidence

    def detect_priority(self, text):
        """Detect priority based on keywords"""
        text_lower = text.lower()
        urgency_score = 0
        
        # Calculate urgency score
        for keyword, weight in self.priority_keywords.items():
            if keyword in text_lower:
                urgency_score += weight
        
        # Simple sentiment analysis - count negative words
        negative_words = ['not', 'can\'t', 'cannot', 'won\'t', 'don\'t', 'failed', 'broken', 'error']
        negative_count = sum(1 for word in negative_words if word in text_lower)
        if negative_count > 2:
            urgency_score += 1
        
        # Priority determination
        if urgency_score >= 5:
            return "Urgent", min(0.95, 0.7 + urgency_score * 0.05)
        elif urgency_score >= 3:
            return "High", min(0.9, 0.6 + urgency_score * 0.05)
        elif urgency_score >= 1:
            return "Medium", min(0.8, 0.5 + urgency_score * 0.05)
        else:
            return "Low", 0.6

    def extract_entities(self, text):
        """Extract entities using regex patterns"""
        entities = {"service": None, "device": None, "location": None}
        
        # Service patterns
        service_patterns = [
            r'\b(office|outlook|teams|sharepoint|onedrive|dropbox|gmail|slack)\b',
            r'\b(windows|linux|macos|ubuntu|ios|android)\b'
        ]
        
        for pattern in service_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["service"] = match.group(1)
                break
        
        # Device patterns
        device_patterns = [
            r'\b(laptop|desktop|computer|pc|server|router|switch|printer|phone)\b'
        ]
        
        for pattern in device_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["device"] = match.group(1)
                break
        
        # Location patterns
        location_patterns = [
            r'\b(office|building|floor|room|conference|lobby)\s*\w*\b'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities["location"] = match.group().strip()
                break
        
        return entities

    def summarize_text(self, text):
        """Create simple extractive summary"""
        if not text:
            return ""
        
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if not sentences:
            return text[:100] + "..." if len(text) > 100 else text
        
        # Take first sentence, max 150 chars
        summary = sentences[0]
        if len(summary) > 150:
            summary = summary[:147] + "..."
        
        return summary

# Initialize classifier
classifier = SimpleTicketClassifier()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(force=True, silent=True) or {}
    description = (data.get('description') or '').strip()
    request_type = (data.get('requestType') or '').strip()
    audio_b64 = data.get('audioBase64')

    if not description and not audio_b64:
        return jsonify({"error": "description or audioBase64 is required"}), 400

    # Use description text
    text = description

    # Category classification
    category, cat_conf = classifier.classify_category(text, request_type)

    # Priority detection
    priority, pri_conf = classifier.detect_priority(text)

    # Entity extraction
    entities = classifier.extract_entities(text)

    # Summary
    summary = classifier.summarize_text(text)

    return jsonify({
        "category": category,
        "priority": priority,
        "summary": summary,
        "entities": entities,
        "confidence": {
            "category": round(cat_conf, 3),
            "priority": round(pri_conf, 3)
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3002))
    print(f"Starting AI Microservice on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"API endpoint: http://localhost:{port}/analyze")
    app.run(host='0.0.0.0', port=port, debug=False)
