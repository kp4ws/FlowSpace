from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from auth import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

class AIGenerateRequest(BaseModel):
    client_name: str
    topic: str
    context: Optional[str] = None

class AISummarizeRequest(BaseModel):
    notes: str

class AIResponse(BaseModel):
    suggestion: str

@router.post("/generate-email", response_model=AIResponse)
def generate_email(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    # Mock implementation
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return AIResponse(suggestion=f"Subject: Follow-up regarding {request.topic}\n\nHi {request.client_name},\n\nI hope this email finds you well. I'm writing to follow up on our discussion about {request.topic}.\n\n{request.context or 'Let me know when you have a moment to chat about next steps.'}\n\nBest regards,\n[Your Name]")

    # Real implementation would go here (omitted for mock mode)
    return AIResponse(suggestion="[AI Response simulated using OpenAI]")

@router.post("/summarize-notes", response_model=AIResponse)
def summarize_notes(
    request: AISummarizeRequest,
    current_user: dict = Depends(get_current_user)
):
    # Mock implementation
    if not os.getenv("OPENAI_API_KEY"):
        return AIResponse(suggestion=f"Summary of notes: The discussion focused on project requirements and timelines. Key takeaways include prioritizing the {request.notes[:50]}... and ensuring all stakeholders are aligned.")

    return AIResponse(suggestion="[AI Summary simulated using OpenAI]")
