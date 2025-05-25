import { create } from "zustand";
type NavigationState = {
  routineId: number | null;
  prevRoute: string | null;
  setRoutineId: (id: number | null) => void;
  setPrevRoute: (route: string | null) => void;
  reset: () => void;
};

export const useNavigationStore = create<NavigationState>((set) => ({
  routineId: null,
  prevRoute: null,
  setRoutineId: (id) => set({ routineId: id }),
  setPrevRoute: (route) => set({ prevRoute: route }),
  reset: () => set({ routineId: null, prevRoute: null }),
}));
