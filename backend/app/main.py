"""
Bhoomijal API Entrypoint
FastAPI application serving groundwater prediction endpoints,
data management pipelines, and interactive web dashboard.
"""
import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.app.config import settings
from backend.app.database.connection import init_db
from backend.app.api.locations import router as locations_router
from backend.app.api.observations import router as observations_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.data_updates import router as data_router

app = FastAPI(
    title="Bhoomijal - Groundwater Intelligence & Prediction API",
    description="AI-powered groundwater depth estimates, 6-month seasonal forecasts, and farmer advisory.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Register API Routers
app.include_router(locations_router, prefix="/api")
app.include_router(observations_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(data_router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for Vercel, Docker, and uptime monitors."""
    return {
        "status": "healthy",
        "service": "Bhoomijal Groundwater Intelligence Platform",
        "version": "1.0.0",
        "database": "connected"
    }

# Mount static and frontend files if present
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
frontend_src = Path(__file__).resolve().parent.parent.parent / "frontend"

assets_dir = frontend_dist / "assets"
if assets_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

if frontend_dist.is_dir():
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        index_file = frontend_dist / "index.html"
        if index_file.is_file():
            return FileResponse(str(index_file))
        return JSONResponse({"status": "Frontend build not found"})
elif frontend_src.exists():
    # In development mode, serve frontend index directly
    @app.get("/")
    async def serve_index():
        index_file = frontend_src / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"message": "Bhoomijal Backend API is active. Visit /docs for interactive endpoints."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
