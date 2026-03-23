"""
AI Czech SQL Reporter — FastAPI backend
Converts Czech questions to SAP B1 SQL, executes against demo SQLite DB.
"""
import os
import re
import sqlite3
import json
from pathlib import Path

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from sap_b1_schema import SAP_B1_SCHEMA_CONTEXT
from demo_db import init_db, get_db, DB_PATH

app = FastAPI(title="AI Czech SQL Reporter", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files from parent directory (index.html etc.)
STATIC_DIR = Path(__file__).parent.parent
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Initialize demo database on startup
@app.on_event("startup")
def startup():
    init_db()


# ─── Models ───────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str  # Czech natural language question


class QueryResponse(BaseModel):
    question: str
    sql: str
    columns: list[str]
    rows: list[list]
    row_count: int
    error: str | None = None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def extract_sql(text: str) -> str:
    """Strip any markdown fencing Claude might add."""
    text = text.strip()
    # Remove ```sql ... ``` or ``` ... ```
    text = re.sub(r"^```(?:sql)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def is_safe_sql(sql: str) -> bool:
    """Only allow SELECT statements."""
    normalized = sql.strip().upper()
    if not normalized.startswith("SELECT"):
        return False
    forbidden = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE",
                 "TRUNCATE", "EXEC", "EXECUTE", "--", "/*", "*/"]
    for kw in forbidden:
        if kw in normalized:
            return False
    return True


def czech_to_sql(question: str) -> str:
    """Call Claude API to convert Czech question to SQL."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        thinking={"type": "adaptive"},
        system=SAP_B1_SCHEMA_CONTEXT,
        messages=[
            {"role": "user", "content": question}
        ]
    )

    # Extract text from response
    sql_text = ""
    for block in response.content:
        if block.type == "text":
            sql_text = block.text
            break

    return extract_sql(sql_text)


def execute_sql(sql: str) -> tuple[list[str], list[list]]:
    """Execute SQL on demo DB, return (columns, rows)."""
    conn = get_db()
    try:
        cursor = conn.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = [list(row) for row in cursor.fetchmany(500)]
        return columns, rows
    finally:
        conn.close()


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def serve_reporter():
    reporter_html = STATIC_DIR / "reporter.html"
    if reporter_html.exists():
        return FileResponse(str(reporter_html))
    return {"message": "AI Czech SQL Reporter API — use /api/query"}


@app.post("/api/query", response_model=QueryResponse)
def query_endpoint(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Otázka nemůže být prázdná.")

    try:
        sql = czech_to_sql(req.question)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chyba při generování SQL: {e}")

    if not is_safe_sql(sql):
        return QueryResponse(
            question=req.question,
            sql=sql,
            columns=[],
            rows=[],
            row_count=0,
            error="Bezpečnostní chyba: vygenerovaný SQL není SELECT dotaz."
        )

    try:
        columns, rows = execute_sql(sql)
    except sqlite3.Error as e:
        return QueryResponse(
            question=req.question,
            sql=sql,
            columns=[],
            rows=[],
            row_count=0,
            error=f"Chyba SQL: {e}"
        )

    return QueryResponse(
        question=req.question,
        sql=sql,
        columns=columns,
        rows=rows,
        row_count=len(rows)
    )


@app.get("/api/health")
def health():
    db_ok = DB_PATH.exists()
    api_key_ok = bool(os.environ.get("ANTHROPIC_API_KEY"))
    return {
        "status": "ok" if (db_ok and api_key_ok) else "degraded",
        "db": "ok" if db_ok else "missing",
        "api_key": "configured" if api_key_ok else "missing"
    }


@app.get("/api/examples")
def examples():
    """Sample Czech questions for the UI."""
    return [
        "Kteří zákazníci mají největší obrat?",
        "Kolik máme otevřených faktur a jaká je jejich celková hodnota?",
        "Jaké zboží máme nejméně na skladě?",
        "Které objednávky jsou po splatnosti?",
        "Jaký je přehled tržeb podle obchodního zástupce?",
        "Kteří dodavatelé mají nejvíce přijatých faktur?",
        "Jaké jsou nejprodávanější položky?",
        "Kolik objednávek bylo vystaveno v posledních 30 dnech?",
    ]
