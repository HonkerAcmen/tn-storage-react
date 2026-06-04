import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUiState {
  collapsed: boolean;
  activityRange: 7 | 30;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setActivityRange: (range: 7 | 30) => void;
}

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      activityRange: 30,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
      setActivityRange: (activityRange) => set({ activityRange }),
    }),
    { name: 'tn-admin-ui' }
  )
);
