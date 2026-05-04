from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routes import auth, notes
from app.core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Notetaker API",
    description="A backend system for notes storage with user authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(notes.router)


@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to Notetaker API"}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)
