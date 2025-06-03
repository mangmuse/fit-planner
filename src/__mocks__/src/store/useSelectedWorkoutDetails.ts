import { create } from "zustand";
type SelectedWorkoutDetailsState = {
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  toggleId: (id: number) => void;
  reset: () => void;
};

export const useSelectedWokroutDetails = create<SelectedWorkoutDetailsState>(
  (set) => ({
    selectedIds: [],
    setSelectedIds: (ids: number[]) => set({ selectedIds: ids }),
    toggleId: (id) =>
      set((state) => {
        if (state.selectedIds.includes(id)) {
          return {
            selectedIds: state.selectedIds.filter((x) => x !== id),
          };
        } else {
          return { selectedIds: [...state.selectedIds, id] };
        }
      }),
    reset: () => set({ selectedIds: [] }),
  })
);
