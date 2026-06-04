import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUiState {
  collapsed: boolean;
  activityRange: 7 | 30;
  activityMetric: 'count' | 'bytes';
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setActivityRange: (range: 7 | 30) => void;
  setActivityMetric: (metric: 'count' | 'bytes') => void;
}

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      activityRange: 30,
      activityMetric: 'count',
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
      setActivityRange: (activityRange) => set({ activityRange }),
      setActivityMetric: (activityMetric) => set({ activityMetric }),
    }),
    { name: 'tn-admin-ui' }
  )
);
