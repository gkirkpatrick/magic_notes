import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import { getMockData, setMockData } from './mocks/handlers';
import type { Note, Tag } from '../types';

vi.mock('../utils/storage', () => ({
  loadPageSize: () => null,
  savePageSize: vi.fn(),
  loadViewMode: () => null,
  saveViewMode: vi.fn(),
  loadIncludeTitle: () => null,
  saveIncludeTitle: vi.fn(),
}));

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock data is automatically reset in setup.ts via resetMockData()
  });

  it('fetches notes on mount', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockData = getMockData();
    expect(result.current.notes).toHaveLength(mockData.notes.length);
    expect(result.current.notes[0].title).toBe('Test Note 1');
  });

  it('fetches tags on mount', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockData = getMockData();
    expect(result.current.tags).toHaveLength(mockData.tags.length);
    expect(result.current.tags[0].name).toBe('test');
  });

  it('filters notes by body text', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.setFilters({
      bodyText: 'content 1',
      includeTitle: false,
      tags: [],
    });

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].title).toBe('Test Note 1');
    });
  });

  it('creates note successfully', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCount = result.current.notes.length;

    const newNote = {
      title: 'New Note',
      content: 'New Content',
      tags: ['test'],
    };

    await result.current.createNote(newNote);

    await waitFor(() => {
      expect(result.current.notes.length).toBe(initialCount + 1);
    });

    const createdNote = result.current.notes.find(n => n.title === 'New Note');
    expect(createdNote).toBeDefined();
    expect(createdNote?.content).toBe('New Content');
  });

  it('updates note successfully', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const updatedData = {
      title: 'Updated Title',
      content: 'Updated Content',
      tags: ['sample'],
    };

    await result.current.updateNote(1, updatedData);

    await waitFor(() => {
      const note = result.current.notes.find(n => n.id === 1);
      expect(note?.title).toBe('Updated Title');
      expect(note?.content).toBe('Updated Content');
    });
  });

  it('deletes note successfully', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCount = result.current.notes.length;

    await result.current.deleteNote(1);

    await waitFor(() => {
      expect(result.current.notes.length).toBe(initialCount - 1);
      expect(result.current.notes.find(n => n.id === 1)).toBeUndefined();
    });
  });

  it('clears error', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger an error by trying to delete non-existent note
    try {
      await result.current.deleteNote(999);
    } catch {
      // Expected to fail
    }

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    result.current.clearError();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('manages pagination correctly', async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(9); // Default page size

    result.current.setPageSize(1);

    await waitFor(() => {
      expect(result.current.pageSize).toBe(1);
      expect(result.current.paginatedNotes).toHaveLength(1);
    });
  });
});
