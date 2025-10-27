# AI Microservice for Smart Service Hub
# Usage:
#   python -m venv .venv
#   .venv\Scripts\activate      # Windows
#   pip install -r requirements.txt
#   python -m textblob.download_corpora  # for sentiment
#   python -m spacy download en_core_web_sm
#   python train.py
#   python app.py

from flask import Flask, request, jsonify
import os
import base64
from model_loader import load_models, classify_category, extract_entities, detect_priority, summarize_text

app = Flask(__name__)

# Lazy load models on first request
MODELS = {
    "nlp": None,
    "clf": None,
    "vectorizer": None
}

def _init_models():
    if MODELS["nlp"] is None:
        models = load_models()
        MODELS.update(models)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/analyze', methods=['POST'])
def analyze():
    # Initialize models if not loaded
    _init_models()
    
    data = request.get_json(force=True, silent=True) or {}
    description = (data.get('description') or '').strip()
    request_type = (data.get('requestType') or '').strip()
    audio_b64 = data.get('audioBase64')

    if not description and not audio_b64:
        return jsonify({"error": "description or audioBase64 is required"}), 400

    # TODO: Audio transcription can be added later if needed
    text = description

    # Category classification
    category, cat_conf = classify_category(text, MODELS['vectorizer'], MODELS['clf'], request_type)

    # Entities
    entities = extract_entities(text, MODELS['nlp'])

    # Priority detection
    priority, pri_conf = detect_priority(text)

    # Summary
    summary = summarize_text(text)

    return jsonify({
        "category": category,
        "priority": priority,
        "summary": summary,
        "entities": entities,
        "confidence": {"category": round(cat_conf, 3), "priority": round(pri_conf, 3)}
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3002))
    app.run(host='0.0.0.0', port=port)
