import { create, StateCreator } from "zustand";

export type SelectedGroupKey = {
  workoutId: number;
  exerciseOrder: number;
};

export type SelectedWorkoutGroupsState = {
  selectedGroups: SelectedGroupKey[];
  setSelectedGroups: (groups: SelectedGroupKey[]) => void;
  toggleGroup: (workoutId: number, exerciseOrder: number) => void;
  toggleAllGroups: (allGroups: SelectedGroupKey[]) => void;
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
  toggleAllGroups: (allGroups) =>
    set((state) => {
      const allSelected =
        allGroups.length > 0 &&
        allGroups.every((group) =>
          state.selectedGroups.some(
            (s) =>
              s.workoutId === group.workoutId &&
              s.exerciseOrder === group.exerciseOrder
          )
        );

      if (allSelected) {
        return {
          selectedGroups: state.selectedGroups.filter(
            (s) =>
              !allGroups.some(
                (g) =>
                  g.workoutId === s.workoutId &&
                  g.exerciseOrder === s.exerciseOrder
              )
          ),
        };
      } else {
        const newGroups = [...state.selectedGroups];
        allGroups.forEach((group) => {
          if (
            !state.selectedGroups.some(
              (s) =>
                s.workoutId === group.workoutId &&
                s.exerciseOrder === group.exerciseOrder
            )
          ) {
            newGroups.push(group);
          }
        });
        return { selectedGroups: newGroups };
      }
    }),
  reset: () => set({ selectedGroups: [] }),
});

export const useSelectedWorkoutGroups = create<SelectedWorkoutGroupsState>(
  createSelectedWorkoutGroupsSlice
);
