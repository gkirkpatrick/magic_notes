import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  it('renders search input with correct placeholder', () => {
    render(
      <SearchBar
        searchText=""
        includeTitle={true}
        onChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search notes...');
    expect(input).toBeInTheDocument();
  });

  it('displays current search text value', () => {
    render(
      <SearchBar
        searchText="test query"
        includeTitle={true}
        onChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search notes...') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('calls onChange with new text when typing', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SearchBar
        searchText=""
        includeTitle={true}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText('Search notes...');
    await user.type(input, 't');

    // Should be called with the new character
    expect(mockOnChange).toHaveBeenCalledWith('t', true);
  });

  it('renders include title checkbox', () => {
    render(
      <SearchBar
        searchText=""
        includeTitle={true}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText('Include title')).toBeInTheDocument();
  });

  it('checkbox is checked when includeTitle is true', () => {
    render(
      <SearchBar
        searchText=""
        includeTitle={true}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('checkbox is unchecked when includeTitle is false', () => {
    render(
      <SearchBar
        searchText=""
        includeTitle={false}
        onChange={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('calls onChange with toggled includeTitle when checkbox clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SearchBar
        searchText="test"
        includeTitle={true}
        onChange={mockOnChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith('test', false);
  });

  it('preserves search text when toggling checkbox', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SearchBar
        searchText="existing search"
        includeTitle={false}
        onChange={mockOnChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith('existing search', true);
  });

  it('input has proper accessibility attributes', () => {
    render(
      <SearchBar
        searchText=""
        includeTitle={true}
        onChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Search notes...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('checkbox label is clickable', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <SearchBar
        searchText=""
        includeTitle={false}
        onChange={mockOnChange}
      />
    );

    const label = screen.getByText('Include title');
    await user.click(label);

    expect(mockOnChange).toHaveBeenCalledWith('', true);
  });
});
