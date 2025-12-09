/**
 * Format a date as relative time (e.g., "today", "yesterday", "3 days ago")
 * or as an absolute date if it's older than 5 days
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Reset time components to compare just the dates
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Calculate difference in days
  const diffTime = today.getTime() - compareDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays >= 2 && diffDays <= 5) {
    return `${diffDays} days ago`;
  } else {
    // Format as readable date (e.g., "Jan 15, 2025")
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * Format a full timestamp for display (e.g., "Jan 15, 2025 at 3:45 PM")
 */
export function formatFullDateTime(dateString: string): string {
  const date = new Date(dateString);

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr} at ${timeStr}`;
}
