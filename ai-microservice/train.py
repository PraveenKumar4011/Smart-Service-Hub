#!/usr/bin/env python3
"""
Training script for Smart Service Hub AI classifier
Creates a category classifier using synthetic training data
"""

import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Create synthetic training data
TRAINING_DATA = [
    # Network issues
    ("WiFi connection keeps dropping in the office", "Network"),
    ("Internet speed is very slow today", "Network"),
    ("Cannot connect to the VPN from home", "Network"),
    ("Network printer is not responding", "Network"),
    ("DNS resolution is failing for external sites", "Network"),
    ("Router needs to be reset frequently", "Network"),
    ("Ethernet port is not working on my laptop", "Network"),
    ("Bandwidth usage is very high", "Network"),
    ("Cannot access shared network drives", "Network"),
    ("Switch port is not getting link", "Network"),
    ("DHCP is not assigning IP addresses", "Network"),
    ("Firewall is blocking legitimate traffic", "Network"),
    ("Wireless signal is weak in conference room", "Network"),
    ("Network cable appears to be damaged", "Network"),
    ("Internet connection is completely down", "Network"),
    
    # Security issues
    ("My password is not working", "Security"),
    ("Account has been locked out", "Security"),
    ("Need access to the secure folder", "Security"),
    ("Suspicious email in my inbox", "Security"),
    ("Antivirus detected a threat", "Security"),
    ("Cannot login to the system", "Security"),
    ("Two-factor authentication is not working", "Security"),
    ("Need to reset my Active Directory password", "Security"),
    ("Security certificate has expired", "Security"),
    ("Possible malware infection on my computer", "Security"),
    ("Firewall is blocking my application", "Security"),
    ("Need permissions to access this database", "Security"),
    ("Login credentials for the new employee", "Security"),
    ("Security audit requires compliance check", "Security"),
    ("Phishing email was received by multiple users", "Security"),
    
    # Cloud issues
    ("OneDrive sync is not working", "Cloud"),
    ("Cannot access files on SharePoint", "Cloud"),
    ("Google Drive is full", "Cloud"),
    ("Backup to cloud failed last night", "Cloud"),
    ("Azure service is returning errors", "Cloud"),
    ("AWS billing seems unusually high", "Cloud"),
    ("Dropbox shared folder permissions", "Cloud"),
    ("Office 365 email is down", "Cloud"),
    ("Teams meeting cannot be joined", "Cloud"),
    ("Cloud storage quota exceeded", "Cloud"),
    ("Salesforce integration is broken", "Cloud"),
    ("Microsoft Azure Active Directory sync", "Cloud"),
    ("Google Workspace calendar sharing", "Cloud"),
    ("iCloud backup is not completing", "Cloud"),
    ("Box file sharing link expired", "Cloud"),
    
    # General issues
    ("Printer is out of toner", "General"),
    ("Software installation help needed", "General"),
    ("Computer is running very slowly", "General"),
    ("Need training on new software", "General"),
    ("Monitor display is flickering", "General"),
    ("Keyboard keys are not working", "General"),
    ("Mouse is not responding", "General"),
    ("Application crashes when I try to save", "General"),
    ("Need help with Excel formulas", "General"),
    ("PowerPoint presentation formatting", "General"),
    ("Computer won't start up", "General"),
    ("Blue screen error on Windows", "General"),
    ("Need new software license", "General"),
    ("Hardware replacement request", "General"),
    ("General IT support question", "General"),
]

def create_dataset():
    """Create training dataset"""
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]
    
    return pd.DataFrame({
        'text': texts,
        'category': labels
    })

def train_classifier():
    """Train the category classifier"""
    print("Creating synthetic training dataset...")
    df = create_dataset()
    
    print(f"Dataset size: {len(df)}")
    print(f"Categories: {df['category'].value_counts().to_dict()}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        df['text'], df['category'], 
        test_size=0.2, 
        random_state=42, 
        stratify=df['category']
    )
    
    # Create TF-IDF vectorizer
    print("Training TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),
        stop_words='english',
        lowercase=True
    )
    
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    
    # Train classifier
    print("Training logistic regression classifier...")
    classifier = LogisticRegression(
        random_state=42,
        max_iter=1000,
        class_weight='balanced'
    )
    
    classifier.fit(X_train_tfidf, y_train)
    
    # Evaluate
    y_pred = classifier.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return vectorizer, classifier

def save_models(vectorizer, classifier):
    """Save trained models"""
    os.makedirs('models', exist_ok=True)
    
    print("Saving models...")
    with open('models/vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    
    with open('models/classifier.pkl', 'wb') as f:
        pickle.dump(classifier, f)
    
    print("Models saved to models/ directory")

def main():
    print("🤖 Training Smart Service Hub AI Classifier")
    print("=" * 50)
    
    vectorizer, classifier = train_classifier()
    save_models(vectorizer, classifier)
    
    print("\n✅ Training completed!")
    print("Run 'python app.py' to start the AI microservice")

if __name__ == '__main__':
    main()