from typing import List, Optional
from django.shortcuts import get_object_or_404
from django.db.models import Q
from ninja import NinjaAPI, Query
from notes.models import Note, Tag, normalize_tag_name
from notes.schemas import NoteIn, NoteOut, TagIn, TagOut


api = NinjaAPI()


@api.get("/notes/", response=List[NoteOut])
def list_notes(
    request,
    body_text: Optional[str] = Query(None),
    title_text: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
):
    """
    List all notes with optional filtering.

    Filters:
    - body_text: substring match on content (case-insensitive)
    - title_text: substring match on title (case-insensitive)
    - If both body_text and title_text are provided, uses OR logic (matches either)
    - tags: list of tag names (OR semantics - note must have at least one of the tags)

    Results are ordered by updated_at DESC.
    """
    qs = Note.objects.all().prefetch_related('tags')

    # Filter by content and/or title using OR logic
    text_filters = Q()

    if body_text:
        body_text_stripped = body_text.strip()
        if body_text_stripped:
            text_filters |= Q(content__icontains=body_text_stripped)

    if title_text:
        title_text_stripped = title_text.strip()
        if title_text_stripped:
            text_filters |= Q(title__icontains=title_text_stripped)

    if text_filters:
        qs = qs.filter(text_filters)

    # Filter by tags if provided (OR semantics)
    if tags:
        normalized_tags = []
        for tag in tags:
            normalized = normalize_tag_name(tag)
            if normalized and normalized not in normalized_tags:
                normalized_tags.append(normalized)

        # Apply tag filter using OR logic
        if normalized_tags:
            qs = qs.filter(tags__name__in=normalized_tags).distinct()

    # Order by updated_at DESC
    qs = qs.order_by('-updated_at')

    return [NoteOut.from_note(note) for note in qs]


@api.get("/notes/{note_id}", response=NoteOut)
def get_note(request, note_id: int):
    """
    Get a single note by ID.
    Returns 404 if note not found.
    """
    note = get_object_or_404(Note, id=note_id)
    return NoteOut.from_note(note)


@api.post("/notes/", response={201: NoteOut})
def create_note(request, payload: NoteIn):
    """
    Create a new note with title, content, and tags.
    Tags are created if they don't exist.
    """
    # Create the note
    note = Note.objects.create(
        title=payload.title,
        content=payload.content
    )

    # Handle tags
    tag_objects = []
    for tag_name in payload.tags:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        tag_objects.append(tag)

    if tag_objects:
        note.tags.set(tag_objects)

    return 201, NoteOut.from_note(note)


@api.put("/notes/{note_id}", response=NoteOut)
def update_note(request, note_id: int, payload: NoteIn):
    """
    Update an existing note's title, content, and tags.
    Returns 404 if note not found.
    """
    note = get_object_or_404(Note, id=note_id)

    # Update title and content
    note.title = payload.title
    note.content = payload.content
    note.save()

    # Update tags
    tag_objects = []
    for tag_name in payload.tags:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        tag_objects.append(tag)

    note.tags.set(tag_objects)

    return NoteOut.from_note(note)


@api.delete("/notes/{note_id}", response={204: None})
def delete_note(request, note_id: int):
    """
    Delete a note by ID.
    Returns 404 if note not found, 204 on success.
    """
    note = get_object_or_404(Note, id=note_id)
    note.delete()
    return 204, None


@api.get("/tags/", response=List[TagOut])
def list_tags(request):
    """
    List all tags sorted by name ascending.
    """
    tags = Tag.objects.all().order_by('name')
    return [TagOut.from_orm(tag) for tag in tags]


@api.post("/tags/", response=TagOut)
def create_tag(request, payload: TagIn):
    """
    Create a new tag or return existing one if it already exists.
    Tag names are normalized (stripped and lowercased).
    """
    # The payload.name is already normalized by the TagIn validator
    tag, created = Tag.objects.get_or_create(name=payload.name)
    return TagOut.from_orm(tag)
