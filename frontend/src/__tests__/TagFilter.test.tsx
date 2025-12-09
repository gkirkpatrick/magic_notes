import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from '../components/TagFilter';
import type { Tag, Note } from '../types';

describe('TagFilter', () => {
  const mockTags: Tag[] = [
    { id: 1, name: 'work' },
    { id: 2, name: 'personal' },
    { id: 3, name: 'important' },
  ];

  const mockNotes: Note[] = [
    {
      id: 1,
      title: 'Note 1',
      content: 'Content 1',
      tags: ['work', 'important'],
      created_at: '2025-01-01T10:00:00Z',
      updated_at: '2025-01-01T10:00:00Z',
    },
    {
      id: 2,
      title: 'Note 2',
      content: 'Content 2',
      tags: ['work'],
      created_at: '2025-01-02T10:00:00Z',
      updated_at: '2025-01-02T10:00:00Z',
    },
    {
      id: 3,
      title: 'Note 3',
      content: 'Content 3',
      tags: ['personal'],
      created_at: '2025-01-03T10:00:00Z',
      updated_at: '2025-01-03T10:00:00Z',
    },
  ];

  it('renders filter button', () => {
    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={[]}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Filter by tags/)).toBeInTheDocument();
  });

  it('displays count when tags are selected', () => {
    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work', 'personal']}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Filter by tags \(2\)/)).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={[]}
        onChange={vi.fn()}
      />
    );

    const button = screen.getByText(/Filter by tags/);
    await user.click(button);

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('personal')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('displays all tags in dropdown', async () => {
    const user = userEvent.setup();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={[]}
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    mockTags.forEach(tag => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it('allows selecting multiple tags', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={[]}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const workCheckbox = screen.getByLabelText(/work/);
    await user.click(workCheckbox);

    expect(onChange).toHaveBeenCalledWith(['work']);
  });

  it('calls onChange with correct array when selecting tag', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const personalCheckbox = screen.getByLabelText(/personal/);
    await user.click(personalCheckbox);

    expect(onChange).toHaveBeenCalledWith(['work', 'personal']);
  });

  it('removes tag when deselecting', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work', 'personal']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const checkboxes = screen.getAllByRole('checkbox');
    const workCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label');
      const text = label?.textContent || '';
      return text.includes('work') && text.includes('(2)');
    });
    if (workCheckbox) {
      await user.click(workCheckbox);
    }

    expect(onChange).toHaveBeenCalledWith(['personal']);
  });

  it('displays selected tags as pills', async () => {
    const user = userEvent.setup();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work', 'important']}
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const pills = screen.getAllByText(/work|important/);
    expect(pills.length).toBeGreaterThan(0);
  });

  it('clears all selected tags', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work', 'personal']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const clearButton = screen.getByText('Clear all');
    await user.click(clearButton);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows "No tags available" when no tags exist', async () => {
    const user = userEvent.setup();

    render(
      <TagFilter
        notes={mockNotes}
        tags={[]}
        selectedTags={[]}
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('checks correct checkboxes for selected tags', async () => {
    const user = userEvent.setup();

    render(
      <TagFilter
        notes={mockNotes}
        tags={mockTags}
        selectedTags={['work', 'important']}
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Filter by tags/));

    const checkboxes = screen.getAllByRole('checkbox');
    const workCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label');
      const text = label?.textContent || '';
      return text.includes('work') && text.includes('(2)');
    }) as HTMLInputElement;
    const personalCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label');
      const text = label?.textContent || '';
      return text.includes('personal') && text.includes('(1)');
    }) as HTMLInputElement;
    const importantCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label');
      const text = label?.textContent || '';
      return text.includes('important') && text.includes('(1)');
    }) as HTMLInputElement;

    expect(workCheckbox.checked).toBe(true);
    expect(personalCheckbox.checked).toBe(false);
    expect(importantCheckbox.checked).toBe(true);
  });
});
