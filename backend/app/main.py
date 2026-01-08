"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.routers import articles, spots, admin, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LUMIÈRE API",
    description="API pour le blog de voyage et photographie",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(articles.router, prefix="/api/articles", tags=["articles"])
app.include_router(spots.router, prefix="/api/spots", tags=["spots"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Serve static files (HTML, CSS, JS)
# Get project root (parent of backend directory)
backend_dir = os.path.dirname(os.path.dirname(__file__))
static_dir = os.path.dirname(backend_dir) if os.path.basename(backend_dir) == 'backend' else backend_dir
static_files_dir = os.path.join(static_dir, "static")
if os.path.exists(static_files_dir):
    app.mount("/static", StaticFiles(directory=static_files_dir), name="static")

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    html_path = os.path.join(static_dir, "generated-page.html")
    if os.path.exists(html_path):
        return FileResponse(html_path, media_type="text/html")
    return {"message": "LUMIÈRE API is running", "html_path": html_path}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "API is running"}
