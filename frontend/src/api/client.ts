import type { Note, Tag, CreateNoteDTO, UpdateNoteDTO, CreateTagDTO, NoteFilters } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    );
  }
  return response.json();
}

function buildQueryString(params: Record<string, string | string[] | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getNotes(filters: NoteFilters): Promise<Note[]> {
  const queryParams = buildQueryString({
    body_text: filters.bodyText,
    title_text: filters.includeTitle ? filters.bodyText : undefined,
    tags: filters.tags,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/notes/${queryParams}`);
    const data = await handleResponse<Note[]>(response);

    // Defensive: ensure tags is always an array
    return data.map(note => ({
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : [],
    }));
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function createNote(noteData: CreateNoteDTO): Promise<Note> {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    const data = await handleResponse<Note>(response);
    return {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function updateNote(id: number, noteData: UpdateNoteDTO): Promise<Note> {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    const data = await handleResponse<Note>(response);
    return {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function deleteNote(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `Failed to delete note ${id}`,
        response.status,
        errorData
      );
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/`);
    return handleResponse<Tag[]>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function createTag(tagData: CreateTagDTO): Promise<Tag> {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tagData),
    });

    return handleResponse<Tag>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}
