import { getTagColor } from '../utils/color';

interface TagPillProps {
  tag: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  count?: number;
}

export function TagPill({ tag, onRemove, size = 'sm', count }: TagPillProps) {
  const colors = getTagColor(tag);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${colors.bg} ${colors.text} border ${colors.border} rounded ${sizeClasses[size]}`}
    >
      {tag}
      {count !== undefined && (
        <span className="opacity-70">({count})</span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-80 font-bold ml-0.5"
          aria-label={`Remove tag ${tag}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
