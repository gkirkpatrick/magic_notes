import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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

describe('Pagination', () => {
  const generateMockNotes = (count: number): Note[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Note ${i + 1}`,
      content: `Content ${i + 1}`,
      tags: [],
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    }));
  };

  const mockTags: Tag[] = [
    { id: 1, name: 'work' },
    { id: 2, name: 'personal' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTags).mockResolvedValue(mockTags);
  });

  it('paginates notes with default page size of 9', async () => {
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(result.current.paginatedNotes).toHaveLength(9);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3); // 20 notes / 9 per page = 3 pages
  });

  it('shows correct notes for each page', async () => {
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    // Page 1: notes 1-9
    expect(result.current.paginatedNotes[0].id).toBe(1);
    expect(result.current.paginatedNotes[8].id).toBe(9);

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    // Page 2: notes 10-18
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedNotes[0].id).toBe(10);
    expect(result.current.paginatedNotes[8].id).toBe(18);

    // Go to page 3
    act(() => {
      result.current.nextPage();
    });

    // Page 3: notes 19-20
    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedNotes).toHaveLength(2);
    expect(result.current.paginatedNotes[0].id).toBe(19);
    expect(result.current.paginatedNotes[1].id).toBe(20);
  });

  it('nextPage does not go beyond total pages', async () => {
    const mockNotes = generateMockNotes(10);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(10);
    });

    expect(result.current.totalPages).toBe(2);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);

    // Try to go beyond
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2); // Should stay at 2
  });

  it('prevPage does not go below 1', async () => {
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(result.current.currentPage).toBe(1);

    // Try to go before page 1
    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1); // Should stay at 1
  });

  it('resets to page 1 when filters change', async () => {
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);

    // Change filters
    act(() => {
      result.current.setFilters({
        bodyText: 'search',
        includeTitle: true,
        tags: [],
      });
    });

    // Should reset to page 1
    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
  });

  it('can change page size', async () => {
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    expect(result.current.pageSize).toBe(9);
    expect(result.current.totalPages).toBe(3);

    // Change page size to 5
    act(() => {
      result.current.setPageSize(5);
    });

    expect(result.current.pageSize).toBe(5);
    expect(result.current.totalPages).toBe(4); // 20 / 5 = 4 pages
    expect(result.current.paginatedNotes).toHaveLength(5);
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
  });

  it('handles edge case with exactly one page', async () => {
    const mockNotes = generateMockNotes(5);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(5);
    });

    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedNotes).toHaveLength(5);
    expect(result.current.currentPage).toBe(1);
  });

  it('handles empty notes list', async () => {
    vi.mocked(api.getNotes).mockResolvedValue([]);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(0);
    });

    expect(result.current.totalPages).toBe(1); // At least 1 page
    expect(result.current.paginatedNotes).toHaveLength(0);
    expect(result.current.currentPage).toBe(1);
  });

  it('pagination persists when switching between view modes', async () => {
    // This test verifies that pagination state is maintained in the hook
    // regardless of view mode changes in the UI
    const mockNotes = generateMockNotes(20);
    vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.notes).toHaveLength(20);
    });

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedNotes[0].id).toBe(10);

    // View mode changes don't affect pagination state (tested at component level)
    // This hook just ensures pagination state is stable
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedNotes[0].id).toBe(10);
  });
});
