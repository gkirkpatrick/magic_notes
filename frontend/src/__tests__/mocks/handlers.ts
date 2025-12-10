import { http, HttpResponse } from 'msw';
import {
  NoteOutSchema,
  NoteInSchema,
  TagSchema,
  TagInSchema,
  type NoteOut,
  type Tag,
} from '../../api/schemas';

const API_BASE_URL = 'http://localhost:8000/api';

// Mock data storage
let mockNotes: NoteOut[] = [
  {
    id: 1,
    title: 'Test Note 1',
    content: 'Test content 1',
    tags: ['test', 'sample'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Test Note 2',
    content: 'Test content 2',
    tags: ['test'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

let mockTags: Tag[] = [
  { id: 1, name: 'test' },
  { id: 2, name: 'sample' },
];

let nextNoteId = 3;
let nextTagId = 3;

/**
 * Validate mock data against Zod schemas
 * This ensures our mocks always match the contract
 */
function validateMockData() {
  mockNotes.forEach((note) => {
    try {
      NoteOutSchema.parse(note);
    } catch (error) {
      console.error('Mock note validation failed:', note, error);
      throw new Error(`Mock note ${note.id} does not match schema`);
    }
  });

  mockTags.forEach((tag) => {
    try {
      TagSchema.parse(tag);
    } catch (error) {
      console.error('Mock tag validation failed:', tag, error);
      throw new Error(`Mock tag ${tag.id} does not match schema`);
    }
  });
}

// Validate mock data on module load
validateMockData();

/**
 * MSW handlers for API endpoints with Zod validation
 */
export const handlers = [
  // GET /notes/
  http.get(`${API_BASE_URL}/notes/`, ({ request }) => {
    const url = new URL(request.url);
    const bodyText = url.searchParams.get('body_text') || '';
    const titleText = url.searchParams.get('title_text') || '';
    const tags = url.searchParams.getAll('tags');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('page_size') || '50', 10);

    let filteredNotes = [...mockNotes];

    // Filter by body text
    if (bodyText) {
      filteredNotes = filteredNotes.filter((note) =>
        note.content.toLowerCase().includes(bodyText.toLowerCase())
      );
    }

    // Filter by title text
    if (titleText) {
      filteredNotes = filteredNotes.filter((note) =>
        note.title.toLowerCase().includes(titleText.toLowerCase())
      );
    }

    // Filter by tags
    if (tags.length > 0) {
      filteredNotes = filteredNotes.filter((note) =>
        tags.some((tag) => note.tags.includes(tag))
      );
    }

    // Paginate results
    const total = filteredNotes.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredNotes.slice(startIndex, endIndex);

    return HttpResponse.json({
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    });
  }),

  // POST /notes/
  http.post(`${API_BASE_URL}/notes/`, async ({ request }) => {
    const body = await request.json();

    // Validate input with Zod
    const validatedInput = NoteInSchema.parse(body);

    // Create new note
    const newNote: NoteOut = {
      id: nextNoteId++,
      title: validatedInput.title,
      content: validatedInput.content,
      tags: validatedInput.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Validate output against schema before storing
    const validatedNote = NoteOutSchema.parse(newNote);
    mockNotes.push(validatedNote);

    return HttpResponse.json(validatedNote, { status: 201 });
  }),

  // PUT /notes/:id
  http.put(`${API_BASE_URL}/notes/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json();

    // Validate input with Zod
    const validatedInput = NoteInSchema.parse(body);

    const noteIndex = mockNotes.findIndex((note) => note.id === id);
    if (noteIndex === -1) {
      return HttpResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }

    // Update note
    const updatedNote: NoteOut = {
      ...mockNotes[noteIndex],
      title: validatedInput.title,
      content: validatedInput.content,
      tags: validatedInput.tags,
      updated_at: new Date().toISOString(),
    };

    // Validate output against schema
    const validatedNote = NoteOutSchema.parse(updatedNote);
    mockNotes[noteIndex] = validatedNote;

    return HttpResponse.json(validatedNote);
  }),

  // DELETE /notes/:id
  http.delete(`${API_BASE_URL}/notes/:id`, ({ params }) => {
    const id = Number(params.id);
    const noteIndex = mockNotes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      return HttpResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }

    mockNotes.splice(noteIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /tags/
  http.get(`${API_BASE_URL}/tags/`, () => {
    return HttpResponse.json(mockTags);
  }),

  // POST /tags/
  http.post(`${API_BASE_URL}/tags/`, async ({ request }) => {
    const body = await request.json();

    // Validate input with Zod
    const validatedInput = TagInSchema.parse(body);

    // Check if tag already exists
    const existingTag = mockTags.find(
      (tag) => tag.name.toLowerCase() === validatedInput.name.toLowerCase()
    );
    if (existingTag) {
      return HttpResponse.json(
        { message: 'Tag already exists' },
        { status: 400 }
      );
    }

    // Create new tag
    const newTag: Tag = {
      id: nextTagId++,
      name: validatedInput.name,
    };

    // Validate output against schema
    const validatedTag = TagSchema.parse(newTag);
    mockTags.push(validatedTag);

    return HttpResponse.json(validatedTag, { status: 201 });
  }),
];

/**
 * Reset mock data to initial state (useful for test isolation)
 */
export function resetMockData() {
  mockNotes = [
    {
      id: 1,
      title: 'Test Note 1',
      content: 'Test content 1',
      tags: ['test', 'sample'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Test Note 2',
      content: 'Test content 2',
      tags: ['test'],
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  mockTags = [
    { id: 1, name: 'test' },
    { id: 2, name: 'sample' },
  ];

  nextNoteId = 3;
  nextTagId = 3;

  validateMockData();
}

/**
 * Get current mock data (useful for test assertions)
 */
export function getMockData() {
  return {
    notes: [...mockNotes],
    tags: [...mockTags],
  };
}

/**
 * Set mock data programmatically (useful for specific test scenarios)
 */
export function setMockData(notes: NoteOut[], tags: Tag[]) {
  // Validate before setting
  notes.forEach((note) => NoteOutSchema.parse(note));
  tags.forEach((tag) => TagSchema.parse(tag));

  mockNotes = [...notes];
  mockTags = [...tags];
}
