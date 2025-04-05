export interface Student {
  id: string;
  name: string;
  avatar: string;
  points: number;
  previousRank: number | null;
  currentRank?: number;
  rankChange?: 'up' | 'down' | 'same' | null;
} 