import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Note, Tag, CreateNoteDTO, UpdateNoteDTO, NoteFilters } from '../types';
import * as api from '../api/client';
import { loadPageSize, savePageSize } from '../utils/storage';

interface UseNotesReturn {
  notes: Note[];
  paginatedNotes: Note[];
  tags: Tag[];
  filters: NoteFilters;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setFilters: (filters: NoteFilters) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  createNote: (noteData: CreateNoteDTO) => Promise<void>;
  updateNote: (id: number, noteData: UpdateNoteDTO) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshTags: () => Promise<void>;
  clearError: () => void;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filters, setFilters] = useState<NoteFilters>({
    bodyText: '',
    includeTitle: true,
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => loadPageSize() ?? 9);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    savePageSize(size);
    setCurrentPage(1);
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(notes.length / pageSize));
  }, [notes.length, pageSize]);

  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return notes.slice(startIndex, endIndex);
  }, [notes, currentPage, pageSize]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedNotes = await api.getNotes(filters);
      setNotes(fetchedNotes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const refreshTags = useCallback(async () => {
    try {
      const fetchedTags = await api.getTags();
      setTags(fetchedTags);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tags';
      setError(message);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  const createNote = useCallback(async (noteData: CreateNoteDTO) => {
    const optimisticNote: Note = {
      id: Date.now(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNotes(prev => [optimisticNote, ...prev]);
    setError(null);

    try {
      const createdNote = await api.createNote(noteData);
      setNotes(prev => prev.map(n => n.id === optimisticNote.id ? createdNote : n));
      await refreshNotes();
    } catch (err) {
      setNotes(prev => prev.filter(n => n.id !== optimisticNote.id));
      const message = err instanceof Error ? err.message : 'Failed to create note';
      setError(message);
      throw err;
    }
  }, [refreshNotes]);

  const updateNote = useCallback(async (id: number, noteData: UpdateNoteDTO) => {
    const previousNotes = notes;
    const updatedNote: Note = {
      ...(notes.find(n => n.id === id) || {} as Note),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      updated_at: new Date().toISOString(),
    };

    setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
    setError(null);

    try {
      const serverNote = await api.updateNote(id, noteData);
      setNotes(prev => prev.map(n => n.id === id ? serverNote : n));
    } catch (err) {
      setNotes(previousNotes);
      const message = err instanceof Error ? err.message : 'Failed to update note';
      setError(message);
      throw err;
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: number) => {
    const previousNotes = notes;
    setNotes(prev => prev.filter(n => n.id !== id));
    setError(null);

    try {
      await api.deleteNote(id);
    } catch (err) {
      setNotes(previousNotes);
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      throw err;
    }
  }, [notes]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notes,
    paginatedNotes,
    tags,
    filters,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalPages,
    setFilters,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    refreshTags,
    clearError,
  };
}
