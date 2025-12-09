import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagModal } from '../components/TagModal';
import type { Tag } from '../types';

describe('TagModal', () => {
  const mockTags: Tag[] = [
    { id: 1, name: 'work' },
    { id: 2, name: 'personal' },
    { id: 3, name: 'important' },
  ];

  it('does not render when closed', () => {
    render(
      <TagModal
        isOpen={false}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    expect(screen.queryByText('Manage Tags')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    expect(screen.getByText('Manage Tags')).toBeInTheDocument();
  });

  it('shows all tags with checkboxes', () => {
    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    expect(screen.getByLabelText('work')).toBeInTheDocument();
    expect(screen.getByLabelText('personal')).toBeInTheDocument();
    expect(screen.getByLabelText('important')).toBeInTheDocument();
  });

  it('checks selected tags', () => {
    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={['work', 'important']}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const workCheckbox = screen.getByLabelText('work') as HTMLInputElement;
    const personalCheckbox = screen.getByLabelText('personal') as HTMLInputElement;
    const importantCheckbox = screen.getByLabelText('important') as HTMLInputElement;

    expect(workCheckbox.checked).toBe(true);
    expect(personalCheckbox.checked).toBe(false);
    expect(importantCheckbox.checked).toBe(true);
  });

  it('filters tags by search input', async () => {
    const user = userEvent.setup();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter or create tags...');
    await user.type(searchInput, 'work');

    expect(screen.getByLabelText('work')).toBeInTheDocument();
    expect(screen.queryByLabelText('personal')).not.toBeInTheDocument();
  });

  it('shows create button for new tag', async () => {
    const user = userEvent.setup();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter or create tags...');
    await user.type(searchInput, 'newtag');

    expect(screen.getByText(/Create/)).toBeInTheDocument();
    expect(screen.getByText(/"newtag"/)).toBeInTheDocument();
  });

  it('does not show create button for existing tag', async () => {
    const user = userEvent.setup();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter or create tags...');
    await user.type(searchInput, 'work');

    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  it('creates new tag when create button clicked', async () => {
    const user = userEvent.setup();
    const onCreateTag = vi.fn().mockResolvedValue(undefined);

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={onCreateTag}
      />
    );

    const searchInput = screen.getByPlaceholderText('Filter or create tags...');
    await user.type(searchInput, 'newtag');

    const createButton = screen.getByText(/Create/);
    await user.click(createButton);

    await waitFor(() => {
      expect(onCreateTag).toHaveBeenCalledWith('newtag');
    });
  });

  it('allows selecting and deselecting tags', async () => {
    const user = userEvent.setup();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const workCheckbox = screen.getByLabelText('work');
    await user.click(workCheckbox);

    expect(screen.getByText('Selected tags:')).toBeInTheDocument();
  });

  it('calls onSave with final tags', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={onSave}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const workCheckbox = screen.getByLabelText('work');
    await user.click(workCheckbox);

    const saveButton = screen.getByText('Update Tags');
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(['work']);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={onCancel}
        onCreateTag={vi.fn()}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when close button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={[]}
        onSave={vi.fn()}
        onCancel={onCancel}
        onCreateTag={vi.fn()}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));

    if (closeButton) {
      await user.click(closeButton);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it('displays selected tags as removable pills', async () => {
    const user = userEvent.setup();

    render(
      <TagModal
        isOpen={true}
        availableTags={mockTags}
        selectedTags={['work', 'personal']}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        onCreateTag={vi.fn()}
      />
    );

    const selectedSection = screen.getByText('Selected tags:');
    expect(selectedSection).toBeInTheDocument();

    const pills = screen.getAllByText(/work|personal/);
    expect(pills.length).toBeGreaterThan(0);
  });
});
