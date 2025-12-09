import type { Note } from '../types';
import { getTagColor } from '../utils/color';
import { formatRelativeTime, formatFullDateTime } from '../utils/date';
import { MarkdownView } from './MarkdownView';

interface NoteCardProps {
  note: Note;
  selected: boolean;
  onSelectChange: (selected: boolean) => void;
  onOpen: () => void;
  viewMode?: 'card' | 'list';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function NoteCard({ note, selected, onSelectChange, onOpen, viewMode = 'card' }: NoteCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelectChange(e.target.checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent, isInteractive: boolean) => {
    if (isInteractive && e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      onOpen();
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-white border rounded-lg p-3 transition-all hover:shadow-sm ${
          selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
        }`}
        role="article"
        aria-label={`Note: ${note.title}`}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            aria-label={`Select note: ${note.title}`}
          />
          <div className="flex-1 min-w-0 flex items-center gap-4">
            <h3
              className="text-base font-semibold text-gray-900 truncate flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              style={{ minWidth: '200px', maxWidth: '300px' }}
              dangerouslySetInnerHTML={{ __html: escapeHtml(note.title) }}
              tabIndex={0}
              role="button"
              onClick={onOpen}
              onKeyDown={(e) => handleKeyDown(e, true)}
              aria-label={`Open note: ${note.title}`}
            />
            <div
              className="text-gray-600 text-sm truncate flex-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 line-clamp-1"
              tabIndex={0}
              role="button"
              onClick={onOpen}
              onKeyDown={(e) => handleKeyDown(e, true)}
              aria-label="Note content preview"
            >
              <MarkdownView content={truncateText(note.content, 100)} className="text-sm inline" />
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-1 flex-shrink-0" role="list" aria-label="Tags">
                {note.tags.slice(0, 3).map((tag, index) => {
                  const colors = getTagColor(tag);
                  return (
                    <span
                      key={`${tag}-${index}`}
                      className={`inline-block px-2 py-0.5 text-xs rounded border ${colors.bg} ${colors.text} ${colors.border} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      dangerouslySetInnerHTML={{ __html: escapeHtml(tag) }}
                      tabIndex={0}
                      role="listitem"
                      aria-label={`Tag: ${tag}`}
                    />
                  );
                })}
                {note.tags.length > 3 && (
                  <span className="text-xs text-gray-500" aria-label={`${note.tags.length - 3} more tags`}>
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            <div
              className="text-xs text-gray-500 flex-shrink-0 ml-auto"
              title={formatFullDateTime(note.updated_at)}
              aria-label={`Updated ${formatFullDateTime(note.updated_at)}`}
            >
              {formatRelativeTime(note.updated_at)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 transition-all hover:shadow-md flex flex-col h-full ${
        selected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      role="article"
      aria-label={`Note: ${note.title}`}
    >
      <div className="flex items-start gap-3 flex-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 flex-shrink-0"
          aria-label={`Select note: ${note.title}`}
        />
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
            dangerouslySetInnerHTML={{ __html: escapeHtml(note.title) }}
            tabIndex={0}
            role="button"
            onClick={onOpen}
            onKeyDown={(e) => handleKeyDown(e, true)}
            aria-label={`Open note: ${note.title}`}
          />
          <div
            className="text-gray-600 text-sm mb-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 line-clamp-3 overflow-hidden"
            tabIndex={0}
            role="button"
            onClick={onOpen}
            onKeyDown={(e) => handleKeyDown(e, true)}
            aria-label="Note content preview"
          >
            <MarkdownView content={truncateText(note.content, 150)} className="text-sm" />
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3" role="list" aria-label="Tags">
              {note.tags.map((tag, index) => {
                const colors = getTagColor(tag);
                return (
                  <span
                    key={`${tag}-${index}`}
                    className={`inline-block px-2 py-1 text-xs rounded border ${colors.bg} ${colors.text} ${colors.border} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    dangerouslySetInnerHTML={{ __html: escapeHtml(tag) }}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`Tag: ${tag}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <div
          className="text-xs text-gray-500"
          title={formatFullDateTime(note.updated_at)}
          aria-label={`Updated ${formatFullDateTime(note.updated_at)}`}
        >
          Updated {formatRelativeTime(note.updated_at)}
        </div>
      </div>
    </div>
  );
}
