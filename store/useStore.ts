import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Task, TreeState, UserImage, Settings } from '../types';
import { calculateTreeState, calculateStreak } from '../utils/treeUtils';

interface AppState {
  tasks: Task[];
  treeState: TreeState;
  userImages: UserImage[];
  settings: Settings;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addImage: (image: UserImage) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

const STORAGE_KEYS = {
  TASKS: '@tree_of_growth:tasks',
  TREE_STATE: '@tree_of_growth:tree_state',
  USER_IMAGES: '@tree_of_growth:user_images',
  SETTINGS: '@tree_of_growth:settings',
};

const initialTreeState: TreeState = {
  growthPoints: 0,
  level: 1,
  currentStage: 'seed',
  leaves: 0,
  totalCompleted: 0,
  streak: 0,
};

const initialSettings: Settings = {
  isDarkMode: false,
  notificationsEnabled: true,
};

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  treeState: initialTreeState,
  userImages: [],
  settings: initialSettings,

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
    
    get().saveData().catch(() => {});
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
    
    get().saveData().catch(() => {});
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    
    get().saveData().catch(() => {});
  },

  toggleTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const now = new Date().toISOString();
    const isCompleting = !task.completed;

    set((state) => {
      const updatedTasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: isCompleting ? now : undefined,
            }
          : t
      );

      // Calculate new tree state
      const completedTasks = updatedTasks.filter((t) => t.completed);
      const newTreeState = calculateTreeState(completedTasks, state.treeState);

      return {
        tasks: updatedTasks,
        treeState: newTreeState,
      };
    });

    get().saveData().catch(() => {});
  },

  addImage: async (image) => {
    // Copy image to user_assets directory
    const userAssetsDir = `${FileSystem.documentDirectory}user_assets/`;
    const fileInfo = await FileSystem.getInfoAsync(userAssetsDir);
    
    if (!fileInfo.exists) {
      await FileSystem.makeDirectoryAsync(userAssetsDir, { intermediates: true });
    }

    const fileName = `${image.id}.jpg`;
    const newPath = `${userAssetsDir}${fileName}`;
    
    await FileSystem.copyAsync({
      from: image.uri,
      to: newPath,
    });

    const newImage: UserImage = {
      ...image,
      uri: newPath,
    };

    set((state) => ({
      userImages: [...state.userImages, newImage],
    }));

    get().saveData().catch(() => {});
  },

  deleteImage: async (id) => {
    const image = get().userImages.find((img) => img.id === id);
    if (image) {
      try {
        await FileSystem.deleteAsync(image.uri, { idempotent: true });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    set((state) => ({
      userImages: state.userImages.filter((img) => img.id !== id),
    }));

    get().saveData().catch(() => {});
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    
    get().saveData().catch(() => {});
  },

  loadData: async () => {
    try {
      const [tasksJson, treeStateJson, userImagesJson, settingsJson] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.TREE_STATE),
          AsyncStorage.getItem(STORAGE_KEYS.USER_IMAGES),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        ]);

      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      const treeState: TreeState = treeStateJson
        ? JSON.parse(treeStateJson)
        : initialTreeState;
      const userImages: UserImage[] = userImagesJson
        ? JSON.parse(userImagesJson)
        : [];
      const settings: Settings = settingsJson
        ? JSON.parse(settingsJson)
        : initialSettings;

      // Recalculate tree state from tasks
      const recalculatedTreeState = calculateTreeState(tasks, treeState);

      set({
        tasks,
        treeState: recalculatedTreeState,
        userImages,
        settings,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },

  saveData: async () => {
    try {
      const { tasks, treeState, userImages, settings } = get();
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)),
        AsyncStorage.setItem(STORAGE_KEYS.TREE_STATE, JSON.stringify(treeState)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_IMAGES, JSON.stringify(userImages)),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  exportData: async () => {
    const { tasks, treeState, userImages, settings } = get();
    return JSON.stringify({ tasks, treeState, userImages, settings }, null, 2);
  },

  importData: async (data: string) => {
    try {
      const imported = JSON.parse(data);
      set({
        tasks: imported.tasks || [],
        treeState: imported.treeState || initialTreeState,
        userImages: imported.userImages || [],
        settings: { ...initialSettings, ...imported.settings },
      });
      await get().saveData();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },
}));
