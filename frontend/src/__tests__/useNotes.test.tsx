import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import * as api from '../api/client';
import type { Note, Tag } from '../types';

vi.mock('../api/client');
vi.mock('../utils/storage', () => ({
  loadPageSize: () => null,
  savePageSize: vi.fn(),
  loadViewMode: () => null,
  saveViewMode: vi.fn(),
  loadIncludeTitle: () => null,
  saveIncludeTitle: vi.fn(),
}));

describe('useNotes', () => {
  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'Test Note',
      content: 'Content',
      tags: ['work'],
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    },
  ];

  const mockTags: Tag[] = [
    { id: 1, name: 'work' },
    { id: 2, name: 'personal' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);
    vi.mocked(api.getTags).mockResolvedValue(mockTags);
  });

  it('fetches notes on mount', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    expect(api.getNotes).toHaveBeenCalled();
  });

  it('fetches tags on mount', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.tags).toEqual(mockTags);
    });

    expect(api.getTags).toHaveBeenCalled();
  });

  it('passes correct query params when fetching notes', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    result.current.setFilters({
      bodyText: 'search',
      includeTitle: true,
      tags: ['work', 'personal'],
    });

    await waitFor(() => {
      expect(api.getNotes).toHaveBeenCalledWith({
        bodyText: 'search',
        includeTitle: true,
        tags: ['work', 'personal'],
      });
    });
  });

  it('creates note optimistically', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const newNote = {
      title: 'New Note',
      content: 'New Content',
      tags: ['work'],
    };

    const createdNote: Note = {
      id: 2,
      ...newNote,
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-02T10:00:00Z',
    };

    vi.mocked(api.createNote).mockResolvedValue(createdNote);
    vi.mocked(api.getNotes).mockResolvedValue([createdNote, ...mockNotes]);

    await result.current.createNote(newNote);

    await waitFor(() => {
      expect(result.current.notes.length).toBeGreaterThan(mockNotes.length);
    });

    expect(api.createNote).toHaveBeenCalledWith(newNote);
  });

  it('rolls back on create failure', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const originalLength = result.current.notes.length;

    const newNote = {
      title: 'Failed Note',
      content: 'Content',
      tags: [],
    };

    vi.mocked(api.createNote).mockRejectedValue(new Error('API Error'));

    try {
      await result.current.createNote(newNote);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.notes.length).toBe(originalLength);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('updates note optimistically', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const updatedData = {
      title: 'Updated Title',
      content: 'Updated Content',
      tags: ['personal'],
    };

    const updatedNote: Note = {
      id: 1,
      ...updatedData,
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-02T10:00:00Z',
    };

    vi.mocked(api.updateNote).mockResolvedValue(updatedNote);

    await result.current.updateNote(1, updatedData);

    await waitFor(() => {
      const note = result.current.notes.find(n => n.id === 1);
      expect(note?.title).toBe('Updated Title');
    });

    expect(api.updateNote).toHaveBeenCalledWith(1, updatedData);
  });

  it('rolls back on update failure', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const originalTitle = result.current.notes[0].title;

    const updatedData = {
      title: 'Failed Update',
      content: 'Content',
      tags: [],
    };

    vi.mocked(api.updateNote).mockRejectedValue(new Error('API Error'));

    try {
      await result.current.updateNote(1, updatedData);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      const note = result.current.notes.find(n => n.id === 1);
      expect(note?.title).toBe(originalTitle);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('deletes note optimistically', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    vi.mocked(api.deleteNote).mockResolvedValue(undefined);

    await result.current.deleteNote(1);

    await waitFor(() => {
      expect(result.current.notes.find(n => n.id === 1)).toBeUndefined();
    });

    expect(api.deleteNote).toHaveBeenCalledWith(1);
  });

  it('rolls back on delete failure', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const originalLength = result.current.notes.length;

    vi.mocked(api.deleteNote).mockRejectedValue(new Error('API Error'));

    try {
      await result.current.deleteNote(1);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.notes.length).toBe(originalLength);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(api.getNotes).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.error).toBe('Fetch failed');
    });
  });

  it('clears error', async () => {
    vi.mocked(api.getNotes).mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.error).toBe('Fetch failed');
    });

    result.current.clearError();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('refreshes notes', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toEqual(mockNotes);
    });

    const newMockNotes: Note[] = [
      ...mockNotes,
      {
        id: 2,
        title: 'Another Note',
        content: 'Content',
        tags: [],
        created_at: '2025-01-02T10:00:00Z',
        updated_at: '2025-01-02T10:00:00Z',
      },
    ];

    vi.mocked(api.getNotes).mockResolvedValue(newMockNotes);

    await result.current.refreshNotes();

    await waitFor(() => {
      expect(result.current.notes).toEqual(newMockNotes);
    });
  });

  it('refreshes tags', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.tags).toEqual(mockTags);
    });

    const newMockTags: Tag[] = [
      ...mockTags,
      { id: 3, name: 'urgent' },
    ];

    vi.mocked(api.getTags).mockResolvedValue(newMockTags);

    await result.current.refreshTags();

    await waitFor(() => {
      expect(result.current.tags).toEqual(newMockTags);
    });
  });
});
