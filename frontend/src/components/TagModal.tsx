import { useState, useEffect } from 'react';
import { TagPill } from './TagPill';
import type { Tag } from '../types';

interface TagModalProps {
  isOpen: boolean;
  availableTags: Tag[];
  selectedTags: string[];
  onSave: (selectedTags: string[]) => void;
  onCancel: () => void;
  onCreateTag: (tagName: string) => Promise<void>;
}

export function TagModal({
  isOpen,
  availableTags,
  selectedTags,
  onSave,
  onCancel,
  onCreateTag,
}: TagModalProps) {
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);
  const [filterText, setFilterText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedTags(selectedTags);
      setFilterText('');
    }
  }, [isOpen, selectedTags]);

  if (!isOpen) return null;

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const exactMatch = availableTags.some(
    tag => tag.name.toLowerCase() === filterText.toLowerCase()
  );

  const canCreateNew = filterText.trim() !== '' && !exactMatch;

  const handleToggleTag = (tagName: string) => {
    setLocalSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleCreateAndSelect = async () => {
    if (!canCreateNew) return;

    setIsCreating(true);
    try {
      await onCreateTag(filterText.trim());
      setLocalSelectedTags(prev => [...prev, filterText.trim()]);
      setFilterText('');
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = () => {
    onSave(localSelectedTags);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="tag-modal-title" className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter or create tags..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
            autoFocus
          />

          {localSelectedTags.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Selected tags:</div>
              <div className="flex flex-wrap gap-1">
                {localSelectedTags.map(tag => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    onRemove={() => handleToggleTag(tag)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
            {canCreateNew && (
              <button
                onClick={handleCreateAndSelect}
                disabled={isCreating}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-700">
                  Create <span className="font-medium">"{filterText}"</span>
                </span>
              </button>
            )}

            {filteredTags.length === 0 && !canCreateNew && (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                {filterText ? 'No matching tags found' : 'No tags available'}
              </div>
            )}

            {filteredTags.map(tag => (
              <label
                key={tag.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={localSelectedTags.includes(tag.name)}
                  onChange={() => handleToggleTag(tag.name)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Tags
          </button>
        </div>
      </div>
    </div>
  );
}
