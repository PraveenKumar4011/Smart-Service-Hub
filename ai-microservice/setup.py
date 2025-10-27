#!/usr/bin/env python3
"""
Setup script for Smart Service Hub AI Microservice
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def main():
    print("🚀 Setting up Smart Service Hub AI Microservice")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Create virtual environment
    if not os.path.exists('.venv'):
        if not run_command("python -m venv .venv", "Creating virtual environment"):
            sys.exit(1)
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = ".venv\\Scripts\\activate"
        pip_command = ".venv\\Scripts\\pip"
        python_command = ".venv\\Scripts\\python"
    else:  # Unix/Linux/macOS
        activate_script = ".venv/bin/activate"
        pip_command = ".venv/bin/pip"
        python_command = ".venv/bin/python"
    
    # Install requirements
    if not run_command(f"{pip_command} install -r requirements.txt", "Installing Python packages"):
        sys.exit(1)
    
    # Download spaCy model
    if not run_command(f"{python_command} -m spacy download en_core_web_sm", "Downloading spaCy English model"):
        print("⚠️  spaCy model download failed. The service will use fallback methods.")
    
    # Download TextBlob corpora
    if not run_command(f"{python_command} -m textblob.download_corpora", "Downloading TextBlob corpora"):
        print("⚠️  TextBlob corpora download failed. Sentiment analysis may be limited.")
    
    # Train the classifier
    if not run_command(f"{python_command} train.py", "Training AI classifier"):
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Activate the virtual environment:")
    if os.name == 'nt':
        print("   .venv\\Scripts\\activate")
    else:
        print("   source .venv/bin/activate")
    
    print("2. Start the AI microservice:")
    print("   python app.py")
    print("\n3. Test the service:")
    print('   curl -X POST http://localhost:3002/analyze -H "Content-Type: application/json" -d \'{"description":"WiFi is down"}\'')

if __name__ == '__main__':
    main()