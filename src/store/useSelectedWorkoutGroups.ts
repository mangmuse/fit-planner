import { create, StateCreator } from "zustand";

export type SelectedGroupKey = {
  workoutId: number;
  exerciseOrder: number;
};

export type SelectedWorkoutGroupsState = {
  selectedGroups: SelectedGroupKey[];
  setSelectedGroups: (groups: SelectedGroupKey[]) => void;
  toggleGroup: (workoutId: number, exerciseOrder: number) => void;
  reset: () => void;
};

export const createSelectedWorkoutGroupsSlice: StateCreator<
  SelectedWorkoutGroupsState
> = (set) => ({
  selectedGroups: [],
  setSelectedGroups: (groups) => set({ selectedGroups: groups }),
  toggleGroup: (workoutId, exerciseOrder) =>
    set((state) => {
      const exists = state.selectedGroups.some(
        (g) => g.workoutId === workoutId && g.exerciseOrder === exerciseOrder
      );
      if (exists) {
        return {
          selectedGroups: state.selectedGroups.filter(
            (g) =>
              !(g.workoutId === workoutId && g.exerciseOrder === exerciseOrder)
          ),
        };
      } else {
        return {
          selectedGroups: [
            ...state.selectedGroups,
            { workoutId, exerciseOrder },
          ],
        };
      }
    }),
  reset: () => set({ selectedGroups: [] }),
});

export const useSelectedWorkoutGroups = create<SelectedWorkoutGroupsState>(
  createSelectedWorkoutGroupsSlice
);
