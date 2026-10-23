"""
Root entrypoint proxy for RE:USE FastAPI backend.
Allows running:
    uvicorn main:app --reload --port 8000
or:
    uvicorn app.main:app --reload --port 8000
or:
    python main.py
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
