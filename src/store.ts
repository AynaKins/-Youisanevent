import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AchievementId } from "./achievements";

type GameState = {
  scene: number;
  completed: number[];
  compliments: string[];
  skin: string;
  manga: string[];
  catFound: boolean;
  achievements: AchievementId[];
  achievementToast: AchievementId | null;
  setScene: (scene: number) => void;
  finish: (scene: number) => void;
  addCompliment: (text: string) => void;
  setSkin: (skin: string) => void;
  setManga: (manga: string[]) => void;
  findCat: () => void;
  unlockAchievement: (achievement: AchievementId) => void;
  dismissAchievement: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      scene: 0,
      completed: [],
      compliments: [],
      skin: "",
      manga: [],
      catFound: false,
      achievements: [],
      achievementToast: null,
      setScene: (scene) => set({ scene }),
      finish: (scene) =>
        set((state) => ({
          completed: state.completed.includes(scene) ? state.completed : [...state.completed, scene],
          scene: Math.min(scene + 1, 7),
        })),
      addCompliment: (text) =>
        set((state) => ({
          compliments: state.compliments.includes(text) ? state.compliments : [...state.compliments, text],
        })),
      setSkin: (skin) => set({ skin }),
      setManga: (manga) => set({ manga }),
      findCat: () => set({ catFound: true }),
      unlockAchievement: (achievement) =>
        set((state) => state.achievements.includes(achievement)
          ? { achievementToast: null }
          : { achievements: [...state.achievements, achievement], achievementToast: achievement }),
      dismissAchievement: () => set({ achievementToast: null }),
      reset: () => set({ scene: 0, completed: [], compliments: [], skin: "", manga: [], catFound: false, achievementToast: null }),
    }),
    {
      name: "ona-sobytie-progress",
      partialize: (state) => ({
        scene: state.scene,
        completed: state.completed,
        compliments: state.compliments,
        skin: state.skin,
        manga: state.manga,
        catFound: state.catFound,
        achievements: state.achievements,
      }),
    },
  ),
);
