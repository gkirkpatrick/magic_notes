import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteCard } from '../components/NoteCard';
import type { Note } from '../types';

describe('NoteCard', () => {
  const mockNote: Note = {
    id: 1,
    title: 'Test Note',
    content: 'This is test content that should be displayed on the card',
    tags: ['work', 'important'],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-02T15:30:00Z',
  };

  it('renders note title', () => {
    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('renders truncated content', () => {
    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText(/This is test content/)).toBeInTheDocument();
  });

  it('truncates long content with ellipsis', () => {
    const longNote: Note = {
      ...mockNote,
      content: 'a'.repeat(200),
    };

    render(
      <NoteCard
        note={longNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    const contentElement = screen.getByText(/a+\.\.\./);
    expect(contentElement).toBeInTheDocument();
  });

  it('renders all tags', () => {
    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('renders updated date', () => {
    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText(/Updated Jan 2, 2025/)).toBeInTheDocument();
  });

  it('checkbox toggles selection', async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();

    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={onSelectChange}
        onOpen={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onSelectChange).toHaveBeenCalledWith(true);
  });

  it('clicking card triggers onOpen', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(
      <NoteCard
        note={mockNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={onOpen}
      />
    );

    // Click on the title button which opens the note
    const titleButton = screen.getByRole('button', { name: /Open note: Test Note/i });
    await user.click(titleButton);
    expect(onOpen).toHaveBeenCalled();
  });

  it('applies selected styling when selected', () => {
    const { container } = render(
      <NoteCard
        note={mockNote}
        selected={true}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    const card = container.querySelector('.ring-2');
    expect(card).toBeInTheDocument();
  });

  it('escapes HTML in title and content', () => {
    const xssNote: Note = {
      ...mockNote,
      title: '<script>alert("xss")</script>',
      content: '<img src=x onerror=alert("xss")>',
    };

    render(
      <NoteCard
        note={xssNote}
        selected={false}
        onSelectChange={vi.fn()}
        onOpen={vi.fn()}
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });
});
