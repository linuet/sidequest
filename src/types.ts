export type QuestCategory =
  | "focus"
  | "health"
  | "social"
  | "learning"
  | "creativity"
  | "order";

export interface Quest {
  id: string;
  title: string;
  category: QuestCategory;
  difficulty: 1 | 2 | 3;
  createdAt: string;
  completedAt: string | null;
}

export interface QuestStore {
  quests: Quest[];
}
