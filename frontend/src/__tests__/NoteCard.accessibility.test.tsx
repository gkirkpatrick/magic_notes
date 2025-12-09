import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteCard } from '../components/NoteCard';
import type { Note } from '../types';

describe('NoteCard Accessibility', () => {
  const mockNote: Note = {
    id: 1,
    title: 'Test Note',
    content: 'This is test content',
    tags: ['work', 'important'],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-02T15:30:00Z',
  };

  describe('Keyboard Navigation', () => {
    it('title is focusable and activates on Enter', async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();

      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={onOpen}
          viewMode="card"
        />
      );

      const title = screen.getByRole('button', { name: /Open note: Test Note/i });
      expect(title).toBeInTheDocument();

      await user.tab();
      // Skip checkbox, should focus title
      await user.tab();
      expect(title).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onOpen).toHaveBeenCalled();
    });

    it('content preview is focusable and activates on Enter', async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();

      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={onOpen}
          viewMode="card"
        />
      );

      const contentPreview = screen.getByRole('button', { name: /Note content preview/i });
      expect(contentPreview).toBeInTheDocument();

      // Tab to content (checkbox -> title -> content)
      await user.tab();
      await user.tab();
      await user.tab();
      expect(contentPreview).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onOpen).toHaveBeenCalled();
    });

    it('tag pills are focusable', async () => {
      const user = userEvent.setup();

      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="card"
        />
      );

      const workTag = screen.getByLabelText('Tag: work');
      const importantTag = screen.getByLabelText('Tag: important');

      // Tab through: checkbox -> title -> content -> work tag
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      expect(workTag).toHaveFocus();

      // Tab to next tag
      await user.tab();
      expect(importantTag).toHaveFocus();
    });

    it('maintains correct tab order: checkbox -> title -> content -> tags', async () => {
      const user = userEvent.setup();

      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="card"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const title = screen.getByRole('button', { name: /Open note/i });
      const content = screen.getByRole('button', { name: /Note content preview/i });
      const workTag = screen.getByLabelText('Tag: work');

      await user.tab();
      expect(checkbox).toHaveFocus();

      await user.tab();
      expect(title).toHaveFocus();

      await user.tab();
      expect(content).toHaveFocus();

      await user.tab();
      expect(workTag).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="card"
        />
      );

      expect(screen.getByLabelText('Select note: Test Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Open note: Test Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Note content preview')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: work')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: important')).toBeInTheDocument();
    });

    it('has article role with descriptive label', () => {
      const { container } = render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="card"
        />
      );

      const article = container.querySelector('[role="article"]');
      expect(article).toBeInTheDocument();
      expect(article).toHaveAttribute('aria-label', 'Note: Test Note');
    });

    it('tags have list role structure', () => {
      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="card"
        />
      );

      const tagsList = screen.getByRole('list', { name: /Tags/i });
      expect(tagsList).toBeInTheDocument();

      const tagItems = screen.getAllByRole('listitem');
      expect(tagItems).toHaveLength(2);
    });
  });

  describe('List View Accessibility', () => {
    it('maintains accessibility in list view', () => {
      render(
        <NoteCard
          note={mockNote}
          selected={false}
          onSelectChange={vi.fn()}
          onOpen={vi.fn()}
          viewMode="list"
        />
      );

      expect(screen.getByLabelText('Select note: Test Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Open note: Test Note')).toBeInTheDocument();
      expect(screen.getByLabelText('Tag: work')).toBeInTheDocument();
    });
  });
});
