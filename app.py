"""
Entry point for FastAPI application
Compatible with Vercel, Railway, and other deployment platforms
"""
import sys
import os

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the FastAPI app
try:
    from app.main import app
except ImportError:
    # Fallback: try importing from backend.app.main
    sys.path.insert(0, os.path.dirname(__file__))
    from backend.app.main import app

__all__ = ['app']
