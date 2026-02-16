from fastapi import FastAPI, Depends, HTTPException, status # Backend Refresh
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from contextlib import asynccontextmanager
from database import create_db_and_tables, seed_data
from routers import clients, invoices, notes, ai, marketplace
from dotenv import load_dotenv, find_dotenv

# Load environment variables from parent folders (monorepo support)
load_dotenv(find_dotenv())

# Lifecycle manager to create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_data()
    yield

import os
import logging
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

# Configure CORS
origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Check if we are in development mode
    is_dev = os.getenv("APP_ENV") == "development" or os.getenv("DATABASE_URL") is None
    
    if is_dev:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )
    
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact support."},
    )

from auth import get_current_user

app.include_router(clients.router)
app.include_router(invoices.router)
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(marketplace.router)


@app.get("/")
def read_root():
    return {"message": "Freelancer Toolkit API is running"}
