import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import WorkoutSequence from "@/app/(main)/workout/_components/WorkoutSequence";
import { reorderDetailGroups } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { customRender, render, screen, waitFor } from "@/test-utils/test-utils";

jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: () => ({
    closeBottomSheet: jest.fn(),
  }),
}));

const mockWorkoutDetail = { ...mockLocalWorkoutDetails[0], workoutId: 1 };
const mockDetailGroups = [
  { exerciseOrder: 1, details: [{ ...mockWorkoutDetail, exerciseOrder: 1 }] },
  {
    exerciseOrder: 2,
    details: [
      {
        ...mockWorkoutDetail,
        workoutId: 2,
        exerciseOrder: 2,
        exerciseName: "벤치프레스",
      },
    ],
  },
];

describe("WorkoutSequence", () => {
  const renderWorkoutSequence = () => {
    const mockLoadFn = jest.fn();
    render(
      <WorkoutSequence
        detailGroups={mockDetailGroups}
        loadLocalWorkoutDetails={mockLoadFn}
      />
    );
    return { mockLoadFn };
  };

  it("전달받은 detailGroup을 올바르게 렌더링한다", async () => {
    renderWorkoutSequence();
    await waitFor(() => {
      expect(screen.getByText("스쿼트")).toBeInTheDocument();
      expect(screen.getByText("벤치프레스")).toBeInTheDocument();
    });
  });

  it("리오더 로직이 올바르게 동작한다", () => {
    const result = reorderDetailGroups(mockDetailGroups, "1", "2");
    expect(result[0].exerciseOrder).toBe(1);
    expect(result[1].exerciseOrder).toBe(2);
  });
});
