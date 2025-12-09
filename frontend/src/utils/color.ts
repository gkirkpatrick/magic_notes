/**
 * Generate a deterministic, accessible color for a tag based on its name.
 * Uses a simple hash function to ensure the same tag always gets the same color.
 */
export function getTagColor(tagName: string): { bg: string; text: string; border: string } {
  // Hash the tag name to get a consistent number
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use modulo to select from a predefined accessible color palette
  const colorPalettes = [
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  ];

  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
}
