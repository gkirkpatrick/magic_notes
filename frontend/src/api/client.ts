import { z } from 'zod';
import {
  NoteOutSchema,
  NoteListSchema,
  PaginatedNotesSchema,
  NoteInSchema,
  TagSchema,
  TagListSchema,
  TagInSchema,
  formatZodError,
  type NoteOut,
  type NoteIn,
  type Tag,
  type TagIn,
  type PaginatedNotes,
} from './schemas';
import type { NoteFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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

/**
 * Handle API response with Zod validation
 * This ensures runtime type safety and catches API contract violations
 */
async function handleResponse<T>(
  response: Response,
  schema: z.ZodSchema<T>
): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData
    );
  }

  const data = await response.json();

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(
        `API response validation failed: ${formatZodError(error)}`,
        response.status,
        { validationErrors: error.errors, responseData: data }
      );
    }
    throw error;
  }
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

export async function getNotes(
  filters: NoteFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedNotes> {
  const queryParams = buildQueryString({
    body_text: filters.bodyText,
    title_text: filters.includeTitle ? filters.bodyText : undefined,
    tags: filters.tags,
    page: String(page),
    page_size: String(pageSize),
  });

  try {
    const response = await fetch(`${API_BASE_URL}/notes/${queryParams}`);
    return handleResponse(response, PaginatedNotesSchema);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function createNote(noteData: NoteIn): Promise<NoteOut> {
  try {
    // Validate input data before sending
    const validatedData = NoteInSchema.parse(noteData);

    const response = await fetch(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    return handleResponse(response, NoteOutSchema);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(`Invalid note data: ${formatZodError(error)}`);
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function updateNote(id: number, noteData: NoteIn): Promise<NoteOut> {
  try {
    // Validate input data before sending
    const validatedData = NoteInSchema.parse(noteData);

    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    return handleResponse(response, NoteOutSchema);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(`Invalid note data: ${formatZodError(error)}`);
    }
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
    return handleResponse(response, TagListSchema);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

export async function createTag(tagData: TagIn): Promise<Tag> {
  try {
    // Validate input data before sending
    const validatedData = TagInSchema.parse(tagData);

    const response = await fetch(`${API_BASE_URL}/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    return handleResponse(response, TagSchema);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new APIError(`Invalid tag data: ${formatZodError(error)}`);
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Connection error (is the server running?)');
    }
    throw error;
  }
}

// Export APIError for use in tests and error handling
export { APIError };
