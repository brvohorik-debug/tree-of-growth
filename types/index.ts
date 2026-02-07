export type TaskCategory = 'daily' | 'long-term' | 'habit';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string;
  repeatPattern?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  imageUri?: string;
}

export interface TreeState {
  growthPoints: number;
  level: number;
  currentStage: 'seed' | 'sprout' | 'small-tree' | 'big-tree' | 'blooming-tree';
  leaves: number;
  totalCompleted: number;
  streak: number;
  lastCompletedDate?: string;
}

export interface UserImage {
  id: string;
  uri: string;
  type: 'leaf' | 'background' | 'reward' | 'theme';
  name: string;
  createdAt: string;
}

export interface Settings {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  selectedTheme?: string;
  selectedBackground?: string;
}
