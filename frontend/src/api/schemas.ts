import { z } from "zod";

/**
 * Zod schemas for runtime validation of API contracts.
 * These schemas serve as the single source of truth for:
 * 1. Form validation (input)
 * 2. API response validation
 * 3. MSW mock validation
 * 4. Contract testing against live APIs
 */

// ============================================================================
// TAG SCHEMAS
// ============================================================================

/**
 * Tag as returned by the API (GET /tags/)
 */
export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
});

/**
 * Tag input for creation (POST /tags/)
 */
export const TagInSchema = z.object({
  name: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Tag name cannot be empty")
    .max(50, "Tag name cannot exceed 50 characters"),
});

export const TagListSchema = z.array(TagSchema);

// ============================================================================
// NOTE SCHEMAS
// ============================================================================

/**
 * Note as returned by the API (GET /notes/, POST /notes/, PUT /notes/{id})
 */
export const NoteOutSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  created_at: z.string(), // ISO 8601 datetime string
  updated_at: z.string(), // ISO 8601 datetime string
});

/**
 * Note input for creation/update (POST /notes/, PUT /notes/{id})
 */
export const NoteInSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(10000, "Content cannot exceed 10,000 characters"),
  tags: z
    .array(z.string().trim().toLowerCase())
    .default([])
    .transform((tags) => {
      // Remove duplicates and empty strings
      const seen = new Set<string>();
      return tags.filter((tag) => {
        if (!tag || seen.has(tag)) return false;
        seen.add(tag);
        return true;
      });
    }),
});

export const NoteListSchema = z.array(NoteOutSchema);

/**
 * Paginated response schema for notes list
 */
export const PaginatedNotesSchema = z.object({
  items: z.array(NoteOutSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  total_pages: z.number(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Tag = z.infer<typeof TagSchema>;
export type TagIn = z.infer<typeof TagInSchema>;
export type NoteOut = z.infer<typeof NoteOutSchema>;
export type NoteIn = z.infer<typeof NoteInSchema>;
export type PaginatedNotes = z.infer<typeof PaginatedNotesSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard to check if a value is a Zod error
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

/**
 * Format Zod validation errors into a user-friendly error message
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((err: z.ZodIssue) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(", ");
}

/**
 * Extract field-specific errors from Zod validation error
 * Useful for form validation
 */
export function extractFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (error && error.issues && Array.isArray(error.issues)) {
    error.issues.forEach((err: z.ZodIssue) => {
      const field = err.path[0];
      if (field && typeof field === "string") {
        fieldErrors[field] = err.message;
      }
    });
  }
  return fieldErrors;
}
