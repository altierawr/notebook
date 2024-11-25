export type TNote = {
  id: string;
  title: string;
  created_at: string;
  content: string;
  tags: string[];
  isTrashed: boolean;
  trashedAt: string;
  isFavorite: boolean;
};
