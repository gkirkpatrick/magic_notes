import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { TagModal } from './TagModal';
import { TagPill } from './TagPill';
import { NoteInSchema, extractFieldErrors, isZodError } from '../api/schemas';
import type { Note, Tag } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  availableTags: Tag[];
  onSave: (noteData: { title: string; content: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
  onCreateTag: (tagName: string) => Promise<void>;
}

export function NoteModal({
  isOpen,
  note,
  availableTags,
  onSave,
  onCancel,
  onCreateTag,
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
      } else {
        setTitle('');
        setContent('');
        setTags([]);
      }
      setErrors({});
    }
  }, [isOpen, note]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    try {
      // Use Zod schema for validation
      NoteInSchema.parse({
        title,
        content,
        tags,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (isZodError(error)) {
        const fieldErrors = extractFieldErrors(error);
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        tags,
      });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="note-modal-title" className="text-lg font-semibold text-gray-900">
              {note ? 'Edit Note' : 'Create Note'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter note title..."
                autoFocus
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className={errors.content ? 'border-2 border-red-500 rounded-lg' : ''} data-color-mode="light">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="live"
                  height={300}
                  visibleDragbar={false}
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <button
                onClick={() => setIsTagModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm text-gray-700">
                  Manage tags {tags.length > 0 && `(${tags.length})`}
                </span>
              </button>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <TagPill
                      key={`${tag}-${index}`}
                      tag={tag}
                      onRemove={() => setTags(tags.filter((_, i) => i !== index))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </div>
      </div>

      <TagModal
        isOpen={isTagModalOpen}
        availableTags={availableTags}
        selectedTags={tags}
        onSave={(newTags) => {
          setTags(newTags);
          setIsTagModalOpen(false);
        }}
        onCancel={() => setIsTagModalOpen(false)}
        onCreateTag={onCreateTag}
      />
    </>
  );
}
