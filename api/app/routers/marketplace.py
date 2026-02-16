from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import SharedWorkspace, SharedWidget
from auth import get_current_user
from typing import List

router = APIRouter()

@router.get("/workspaces", response_model=List[SharedWorkspace])
def get_public_workspaces(session: Session = Depends(get_session)):
    return session.exec(select(SharedWorkspace).where(SharedWorkspace.is_public == True)).all()

@router.post("/workspaces/share")
def share_workspace(
    workspace: SharedWorkspace, 
    user: dict = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    workspace.user_id = user["sub"]
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return workspace

@router.post("/workspaces/{workspace_id}/like")
def like_workspace(
    workspace_id: int, 
    session: Session = Depends(get_session)
):
    workspace = session.get(SharedWorkspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    workspace.likes_count += 1
    session.add(workspace)
    session.commit()
    session.refresh(workspace)
    return {"likes_count": workspace.likes_count}

@router.get("/widgets", response_model=List[SharedWidget])
def get_public_widgets(session: Session = Depends(get_session)):
    return session.exec(select(SharedWidget).where(SharedWidget.is_public == True)).all()

@router.post("/widgets/share")
def share_widget(
    widget: SharedWidget, 
    user: dict = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    widget.user_id = user["sub"]
    session.add(widget)
    session.commit()
    session.refresh(widget)
    return widget

@router.post("/widgets/{widget_id}/like")
def like_widget(
    widget_id: int, 
    session: Session = Depends(get_session)
):
    widget = session.get(SharedWidget, widget_id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    widget.likes_count += 1
    session.add(widget)
    session.commit()
    session.refresh(widget)
    return {"likes_count": widget.likes_count}
