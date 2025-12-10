/**
 * Re-export Zod-validated types from schemas
 * This maintains backward compatibility while ensuring
 * all types come from the single source of truth
 */
export type { NoteOut as Note, NoteIn, Tag, TagIn } from './api/schemas';

export interface NoteFilters {
  bodyText: string;
  includeTitle: boolean;
  tags: string[];
}

// Legacy aliases for backward compatibility
export type CreateNoteDTO = NoteIn;
export type UpdateNoteDTO = NoteIn;
export type CreateTagDTO = TagIn;

import type { NoteIn, TagIn } from './api/schemas';
