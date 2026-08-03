import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SelectedProject {
  id: string;
  code: string;
  name: string;
  slug: string;
}

interface ProjectState {
  selectedProject: SelectedProject | null;
  setSelectedProject: (project: SelectedProject | null) => void;
  clearSelectedProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProject: null,
      setSelectedProject: (selectedProject) => set({ selectedProject }),
      clearSelectedProject: () => set({ selectedProject: null }),
    }),
    {
      name: 'selected_project',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
