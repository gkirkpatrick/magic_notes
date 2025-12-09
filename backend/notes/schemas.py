from datetime import datetime
from typing import List
from pydantic import BaseModel, field_validator, model_validator
from notes.models import normalize_tag_name


class TagIn(BaseModel):
    """Schema for creating/updating tags."""
    name: str

    @field_validator('name')
    @classmethod
    def normalize_and_validate_name(cls, v: str) -> str:
        """Strip whitespace, lowercase, and ensure non-empty."""
        normalized = normalize_tag_name(v)
        if not normalized:
            raise ValueError('Tag name cannot be empty or whitespace-only')
        return normalized


class TagOut(BaseModel):
    """Schema for tag responses."""
    id: int
    name: str

    class Config:
        from_attributes = True


class NoteIn(BaseModel):
    """Schema for creating/updating notes."""
    title: str
    content: str
    tags: List[str] = []

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Strip whitespace and ensure non-empty, max 200 chars."""
        stripped = v.strip()
        if not stripped:
            raise ValueError('Title cannot be empty or whitespace-only')
        if len(stripped) > 200:
            raise ValueError('Title cannot exceed 200 characters')
        return stripped

    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        """Strip whitespace and ensure non-empty, max 10,000 chars."""
        stripped = v.strip()
        if not stripped:
            raise ValueError('Content cannot be empty or whitespace-only')
        if len(stripped) > 10000:
            raise ValueError('Content cannot exceed 10,000 characters')
        return stripped

    @field_validator('tags')
    @classmethod
    def normalize_tags(cls, v: List[str]) -> List[str]:
        """Normalize tags: strip, lowercase, remove empties, deduplicate."""
        normalized = []
        seen = set()
        for tag in v:
            normalized_tag = normalize_tag_name(tag)
            if normalized_tag and normalized_tag not in seen:
                normalized.append(normalized_tag)
                seen.add(normalized_tag)
        return normalized


class NoteOut(BaseModel):
    """Schema for note responses."""
    id: int
    title: str
    content: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def from_note(note):
        """Convert a Note model instance to NoteOut schema."""
        return NoteOut(
            id=note.id,
            title=note.title,
            content=note.content,
            tags=[tag.name for tag in note.tags.all()],
            created_at=note.created_at,
            updated_at=note.updated_at,
        )

    class Config:
        from_attributes = True
