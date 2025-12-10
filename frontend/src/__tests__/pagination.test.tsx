import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotes } from '../hooks/useNotes';
import { setMockData, getMockData } from './mocks/handlers';
import type { NoteOut } from '../api/schemas';
import type { Tag } from '../types';

vi.mock('../utils/storage', () => ({
  loadPageSize: () => null,
  savePageSize: vi.fn(),
  loadViewMode: () => null,
  saveViewMode: vi.fn(),
  loadIncludeTitle: () => null,
  saveIncludeTitle: vi.fn(),
}));

describe('Pagination (Server-Side)', () => {
  const generateMockNotes = (count: number): NoteOut[] => {
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
  });

  it('fetches notes with default page size of 9', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // With server-side pagination, we only get one page at a time
    expect(result.current.notes).toHaveLength(9); // First page
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3); // 20 notes / 9 per page = 3 pages
    expect(result.current.paginatedNotes).toHaveLength(9);
  });

  it('fetches next page when nextPage is called', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Page 1: notes 1-9
    expect(result.current.notes[0].id).toBe(1);
    expect(result.current.currentPage).toBe(1);

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Page 2: notes 10-18
    expect(result.current.notes).toHaveLength(9);
    expect(result.current.notes[0].id).toBe(10);
    expect(result.current.notes[8].id).toBe(18);
  });

  it('handles last page with fewer items', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Go to page 3 (last page)
    act(() => {
      result.current.setCurrentPage(3);
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(3);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Page 3: notes 19-20 (only 2 items)
    expect(result.current.notes).toHaveLength(2);
    expect(result.current.notes[0].id).toBe(19);
    expect(result.current.notes[1].id).toBe(20);
  });

  it('nextPage does not go beyond total pages', async () => {
    const mockNotes = generateMockNotes(10);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalPages).toBe(2);

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    // Try to go beyond
    act(() => {
      result.current.nextPage();
    });

    // Should stay at page 2
    expect(result.current.currentPage).toBe(2);
  });

  it('prevPage does not go below 1', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
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
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

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

  it('can change page size and refetches', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pageSize).toBe(9);
    expect(result.current.totalPages).toBe(3);

    // Change page size to 5
    act(() => {
      result.current.setPageSize(5);
    });

    await waitFor(() => {
      expect(result.current.pageSize).toBe(5);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalPages).toBe(4); // 20 / 5 = 4 pages
    expect(result.current.notes).toHaveLength(5); // First page with new size
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
  });

  it('handles edge case with exactly one page', async () => {
    const mockNotes = generateMockNotes(5);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.totalPages).toBe(1);
    expect(result.current.notes).toHaveLength(5);
    expect(result.current.paginatedNotes).toHaveLength(5);
    expect(result.current.currentPage).toBe(1);
  });

  it('handles empty notes list', async () => {
    setMockData([], mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notes).toHaveLength(0);
    expect(result.current.paginatedNotes).toHaveLength(0);
    expect(result.current.currentPage).toBe(1);
    // totalPages will be 0 when there are no results
    expect(result.current.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('pagination state persists across re-renders', async () => {
    const mockNotes = generateMockNotes(20);
    setMockData(mockNotes, mockTags);

    const { result } = renderHook(() => useNotes());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Go to page 2
    act(() => {
      result.current.nextPage();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Pagination state is maintained
    expect(result.current.currentPage).toBe(2);
    expect(result.current.notes[0].id).toBe(10);
  });
});
