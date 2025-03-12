jest.mock("@/services/exercise.service");
import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import WorkoutExerciseGroup from "@/app/(main)/workout/_components/WorkoutExerciseGroup";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import { customRender, screen, waitFor } from "@/test-utils/test-utils";
import { LocalWorkoutDetail } from "@/types/models";

describe("WorkoutExerciseGroup", () => {
  const detail: LocalWorkoutDetail = {
    id: 1,
    exerciseId: 102,
    exerciseName: "스쿼트",
    exerciseOrder: 2,
    isDone: false,
    isSynced: false,
    reps: 0,
    weight: 0,
    rpe: null,
    setOrder: 1,
    setType: "NORMAL",
    serverId: null,
    workoutId: 1,
    createdAt: "2025-02-11T02:50:05.917Z",
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getExerciseWithLocalId as jest.Mock).mockResolvedValue({
      id: 102,
      name: "스쿼트",
      category: "하체",
      isCustom: false,
      isBookmarked: false,
      unit: "kg",

      createdAt: "2023-01-02T00:00:00Z",
      userId: null,
      imageUrl: "https://example.com/push-up.png",
    });
  });

  const mockWorkoutDetails = [
    { ...detail, id: 1, setOrder: 1 },
    { ...detail, id: 2, setOrder: 2 },
    { ...detail, id: 3, setOrder: 3 },
  ];

  const renderWorkoutExerciseGroup = () => {
    const loadDetailsMock = jest.fn();
    customRender(
      <WorkoutExerciseGroup
        details={mockWorkoutDetails}
        exerciseOrder={2}
        loadLocalWorkoutDetails={loadDetailsMock}
      />
    );
  };
  it("운동 순서와 운동 이름을 올바르게 표시한다", async () => {
    renderWorkoutExerciseGroup();
    await waitFor(() => {
      expect(screen.getByTestId("exercise-order")).toHaveTextContent(
        detail.exerciseOrder.toString()
      );

      expect(screen.getByText(detail.exerciseName)).toBeInTheDocument();
    });
  });
  it("WorkoutTableHeader 을 올바르게 렌더링한다", async () => {
    renderWorkoutExerciseGroup();

    const header = await screen.findByTestId("workout-table-header");
    expect(header).toBeInTheDocument();
  });
  it("WorkoutItem 을 올바르게 렌더링한다", async () => {
    renderWorkoutExerciseGroup();

    await waitFor(() => {
      mockWorkoutDetails.forEach((detail) => {
        expect(
          screen.getByTestId(`workout-detail-item-${detail.id}`)
        ).toBeInTheDocument();
      });
    });
  });
  it("SetActions 를 올바르게 렌더링한다", async () => {
    renderWorkoutExerciseGroup();
    const setActions = await screen.findByTestId("set-actions");
    expect(setActions).toBeInTheDocument();
  });
});
