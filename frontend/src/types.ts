export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface NoteFilters {
  bodyText: string;
  includeTitle: boolean;
  tags: string[];
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateNoteDTO {
  title: string;
  content: string;
  tags: string[];
}

export interface CreateTagDTO {
  name: string;
}
