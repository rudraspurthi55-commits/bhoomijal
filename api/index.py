"""
Vercel Serverless Function Bridge for Bhoomijal FastAPI backend
"""
import os
import sys

# Add parent directory and backend app directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app

# Vercel looks for 'app' ASGI handler
