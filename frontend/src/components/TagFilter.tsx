import { useState, useRef, useEffect, useMemo } from 'react';
import { TagPill } from './TagPill';
import type { Tag, Note } from '../types';

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  notes: Note[];
  onChange: (selectedTags: string[]) => void;
}

export function TagFilter({ tags, selectedTags, notes, onChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate note counts for each tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [notes]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter(t => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        aria-expanded={isOpen}
        aria-label="Filter by tags"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-sm text-gray-700">
          Filter by tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Select tags</span>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map(tag => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    onRemove={() => handleToggleTag(tag)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {tags.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No tags available</div>
            ) : (
              tags.map(tag => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.name)}
                    onChange={() => handleToggleTag(tag.name)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {tag.name}
                    {tagCounts[tag.name] !== undefined && (
                      <span className="text-gray-500 ml-1">({tagCounts[tag.name]})</span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
