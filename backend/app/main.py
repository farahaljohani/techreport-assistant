import asyncio
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import upload, ai_tools

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def _cleanup_old_uploads() -> int:
    """Delete PDF files older than `UPLOAD_RETENTION_HOURS`.

    Returns the number of files removed. Also evicts matching entries from
    the in-memory `reports_store` in the upload route so we do not hand out
    metadata pointing to files that no longer exist.
    """
    retention_hours = settings.UPLOAD_RETENTION_HOURS
    if retention_hours <= 0:
        return 0

    cutoff = time.time() - retention_hours * 3600
    removed = 0

    try:
        entries = list(os.scandir(UPLOAD_DIR))
    except FileNotFoundError:
        return 0

    for entry in entries:
        if not entry.is_file() or not entry.name.lower().endswith(".pdf"):
            continue
        try:
            mtime = entry.stat().st_mtime
        except FileNotFoundError:
            continue
        if mtime >= cutoff:
            continue
        try:
            os.remove(entry.path)
            removed += 1
        except OSError:
            continue
        # Best-effort eviction from the in-memory store
        file_id = entry.name[:-4]  # strip .pdf
        upload.reports_store.pop(file_id, None)

    return removed


async def _cleanup_loop() -> None:
    interval_seconds = max(60, settings.CLEANUP_INTERVAL_MINUTES * 60)
    # Run once shortly after startup so we never leave stale files around
    # if the server was down during the previous scheduled run.
    await asyncio.sleep(5)
    while True:
        try:
            removed = await _cleanup_old_uploads()
            if removed:
                print(f"🧹 Cleanup: removed {removed} stale upload(s)")
        except Exception as exc:  # noqa: BLE001 - best-effort background task
            print(f"⚠️ Cleanup error: {exc}")
        await asyncio.sleep(interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kick off the cleanup loop in the background (if enabled).
    task: asyncio.Task | None = None
    if settings.UPLOAD_RETENTION_HOURS > 0:
        task = asyncio.create_task(_cleanup_loop())
    try:
        yield
    finally:
        if task is not None:
            task.cancel()
            try:
                await task
            except (asyncio.CancelledError, Exception):
                pass


app = FastAPI(
    title="Tech Report Assistant API",
    description="API for reading and understanding technical reports with AI assistance",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(ai_tools.router, prefix="/api", tags=["ai"])


@app.get("/")
async def root():
    return {
        "message": "Tech Report Assistant API is running",
        "docs": "/docs",
        "endpoints": {
            "upload": "/api/upload",
            "summarize": "/api/summarize",
            "explain": "/api/explain",
            "ask_question": "/api/ask-question",
            "explain_equation": "/api/explain-equation",
            "convert_units": "/api/convert-units",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "tech-report-assistant-backend"}
