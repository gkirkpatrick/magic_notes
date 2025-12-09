import { NoteCard } from './NoteCard';
import type { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteIds: Set<number>;
  onSelectNote: (noteId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onOpenNote: (note: Note) => void;
  viewMode: 'card' | 'list';
}

export function NoteList({
  notes,
  selectedNoteIds,
  onSelectNote,
  onSelectAll,
  onOpenNote,
  viewMode,
}: NoteListProps) {
  const allSelected = notes.length > 0 && notes.every(note => selectedNoteIds.has(note.id));
  const someSelected = notes.some(note => selectedNoteIds.has(note.id)) && !allSelected;

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No notes found</h3>
        <p className="text-gray-500 text-sm">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-1">
        <input
          type="checkbox"
          checked={allSelected}
          ref={input => {
            if (input) {
              input.indeterminate = someSelected;
            }
          }}
          onChange={handleSelectAllChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700 select-none">
          {allSelected ? 'Deselect all' : someSelected ? 'Select all' : 'Select all'}
        </label>
        {selectedNoteIds.size > 0 && (
          <span className="text-sm text-gray-500">
            ({selectedNoteIds.size} selected)
          </span>
        )}
      </div>

      <div className={viewMode === 'card' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            selected={selectedNoteIds.has(note.id)}
            onSelectChange={(selected) => onSelectNote(note.id, selected)}
            onOpen={() => onOpenNote(note)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
