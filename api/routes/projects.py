from fastapi import APIRouter
from fastapi import APIRouter, Depends, HTTPException, status
from src.schemas.api.generation_request import P
router = APIRouter(tags=["Projects"])


@router.post("/projects")