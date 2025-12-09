import { useState, useCallback, useEffect, useRef } from 'react';
import { useNotes } from './hooks/useNotes';
import { SearchBar } from './components/SearchBar';
import { TagFilter } from './components/TagFilter';
import { NoteList } from './components/NoteList';
import { NoteModal } from './components/NoteModal';
import { PaginationControls } from './components/PaginationControls';
import { createTag } from './api/client';
import { saveViewMode, loadViewMode, saveIncludeTitle, loadIncludeTitle } from './utils/storage';
import type { Note } from './types';

function App() {
  const {
    notes,
    paginatedNotes,
    tags,
    filters,
    isLoading,
    error,
    currentPage,
    totalPages,
    setFilters,
    nextPage,
    prevPage,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    refreshTags,
    clearError,
  } = useNotes();

  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewMode, setViewModeState] = useState<'card' | 'list'>(() => loadViewMode() ?? 'card');
  const notesListRef = useRef<HTMLDivElement>(null);

  const setViewMode = useCallback((mode: 'card' | 'list') => {
    setViewModeState(mode);
    saveViewMode(mode);
  }, []);

  const handleSearchChange = useCallback((searchText: string, includeTitle: boolean) => {
    setFilters({
      ...filters,
      bodyText: searchText,
      includeTitle,
    });
    saveIncludeTitle(includeTitle);
  }, [filters, setFilters]);

  // Load include title preference on mount
  useEffect(() => {
    const savedIncludeTitle = loadIncludeTitle();
    if (savedIncludeTitle !== null && savedIncludeTitle !== filters.includeTitle) {
      setFilters({
        ...filters,
        includeTitle: savedIncludeTitle,
      });
    }
  }, []); // Only on mount

  const handleTagFilterChange = useCallback((selectedTags: string[]) => {
    setFilters({
      ...filters,
      tags: selectedTags,
    });
  }, [filters, setFilters]);

  const handleSelectNote = useCallback((noteId: number, selected: boolean) => {
    setSelectedNoteIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(noteId);
      } else {
        next.delete(noteId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedNoteIds(new Set(paginatedNotes.map(n => n.id)));
    } else {
      setSelectedNoteIds(new Set());
    }
  }, [paginatedNotes]);

  const handleOpenNote = useCallback((note: Note) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  }, []);

  const handleCreateNote = useCallback(() => {
    setEditingNote(null);
    setNoteModalOpen(true);
  }, []);

  const handleSaveNote = useCallback(async (noteData: { title: string; content: string; tags: string[] }) => {
    if (editingNote) {
      await updateNote(editingNote.id, noteData);
    } else {
      await createNote(noteData);
    }
    setNoteModalOpen(false);
    setEditingNote(null);
  }, [editingNote, createNote, updateNote]);

  const handleCancelNote = useCallback(() => {
    setNoteModalOpen(false);
    setEditingNote(null);
  }, []);

  const handleCreateTag = useCallback(async (tagName: string) => {
    await createTag({ name: tagName });
    await refreshTags();
  }, [refreshTags]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedNoteIds.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedNoteIds.size} note${selectedNoteIds.size > 1 ? 's' : ''}?`
    );

    if (!confirmed) return;

    const deletePromises = Array.from(selectedNoteIds).map(id => deleteNote(id));
    await Promise.all(deletePromises);
    setSelectedNoteIds(new Set());
  }, [selectedNoteIds, deleteNote]);

  const handleSkipToNotes = (e: React.MouseEvent) => {
    e.preventDefault();
    notesListRef.current?.focus();
  };

  const handleRetry = useCallback(async () => {
    clearError();
    await refreshNotes();
  }, [clearError, refreshNotes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Navigation Link */}
      <a
        href="#notes-list"
        onClick={handleSkipToNotes}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to notes list
      </a>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Notes</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-800">{error}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  aria-label="Retry fetching data"
                >
                  Retry
                </button>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Dismiss error message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
            <SearchBar
              searchText={filters.bodyText}
              includeTitle={filters.includeTitle}
              onChange={handleSearchChange}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <TagFilter
                  tags={tags}
                  selectedTags={filters.tags}
                  notes={notes}
                  onChange={handleTagFilterChange}
                />

                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden" role="group" aria-label="View mode toggle">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`px-3 py-2 text-sm transition-colors ${
                      viewMode === 'card'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Card view"
                    aria-label="Switch to card view"
                    aria-pressed={viewMode === 'card'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="List view"
                    aria-label="Switch to list view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedNoteIds.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                    aria-label={`Delete ${selectedNoteIds.size} selected note${selectedNoteIds.size > 1 ? 's' : ''}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="hidden sm:inline">Delete</span> ({selectedNoteIds.size})
                  </button>
                )}

                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  aria-label="Create new note"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Create</span><span className="sm:hidden">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading && paginatedNotes.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading notes...</span>
            </div>
          </div>
        ) : (
          <div
            id="notes-list"
            ref={notesListRef}
            tabIndex={-1}
            className="focus:outline-none"
          >
            {/* Top Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              position="top"
            />

            <NoteList
              notes={paginatedNotes}
              selectedNoteIds={selectedNoteIds}
              onSelectNote={handleSelectNote}
              onSelectAll={handleSelectAll}
              onOpenNote={handleOpenNote}
              viewMode={viewMode}
            />

            {/* Bottom Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              position="bottom"
            />
          </div>
        )}
      </div>

      <NoteModal
        isOpen={noteModalOpen}
        note={editingNote}
        availableTags={tags}
        onSave={handleSaveNote}
        onCancel={handleCancelNote}
        onCreateTag={handleCreateTag}
      />
    </div>
  );
}

export default App;
