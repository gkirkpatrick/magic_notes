import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteList } from '../components/NoteList';
import type { Note } from '../types';

describe('NoteList', () => {
  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'First Note',
      content: 'Content 1',
      tags: ['tag1'],
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Second Note',
      content: 'Content 2',
      tags: ['tag2'],
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-02T10:00:00Z',
    },
    {
      id: 3,
      title: 'Third Note',
      content: 'Content 3',
      tags: [],
      created_at: '2025-01-03T10:00:00Z',
      updated_at: '2025-01-03T10:00:00Z',
    },
  ];

  it('renders multiple note cards', () => {
    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set()}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    expect(screen.getByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
    expect(screen.getByText('Third Note')).toBeInTheDocument();
  });

  it('displays empty state when no notes', () => {
    render(
      <NoteList
        notes={[]}
        selectedNoteIds={new Set()}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    expect(screen.getByText('No notes found')).toBeInTheDocument();
    expect(screen.getByText('Create your first note to get started')).toBeInTheDocument();
  });

  it('renders select all checkbox', () => {
    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set()}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('select all checkbox selects all notes', async () => {
    const user = userEvent.setup();
    const onSelectAll = vi.fn();

    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set()}
        onSelectNote={vi.fn()}
        onSelectAll={onSelectAll}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it('select all checkbox is checked when all notes selected', () => {
    const { container } = render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set([1, 2, 3])}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
    expect(selectAllCheckbox.checked).toBe(true);
  });

  it('select all checkbox is indeterminate when some notes selected', () => {
    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set([1, 2])}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
    expect(selectAllCheckbox.indeterminate).toBe(true);
  });

  it('displays selection count', () => {
    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set([1, 2])}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    expect(screen.getByText('(2 selected)')).toBeInTheDocument();
  });

  it('calls onOpenNote when note card is clicked', async () => {
    const user = userEvent.setup();
    const onOpenNote = vi.fn();

    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set()}
        onSelectNote={vi.fn()}
        onSelectAll={vi.fn()}
        onOpenNote={onOpenNote}
        viewMode="card"
      />
    );

    // Click on the title button of the first note
    const firstNoteTitle = screen.getByRole('button', { name: /Open note: First Note/i });
    await user.click(firstNoteTitle);
    expect(onOpenNote).toHaveBeenCalledWith(mockNotes[0]);
  });

  it('calls onSelectNote when individual note is selected', async () => {
    const user = userEvent.setup();
    const onSelectNote = vi.fn();

    render(
      <NoteList
        notes={mockNotes}
        selectedNoteIds={new Set()}
        onSelectNote={onSelectNote}
        onSelectAll={vi.fn()}
        onOpenNote={vi.fn()}
        viewMode="card"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(onSelectNote).toHaveBeenCalled();
  });
});
