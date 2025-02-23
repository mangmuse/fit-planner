jest.mock("@/services/workoutDetail.service");
import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { customRender, screen } from "@/test-utils/test-utils";
import { LocalWorkoutDetail } from "@/types/models";
import userEvent from "@testing-library/user-event";

describe("WorkoutItem", () => {
  const renderWorkoutItem = (detail?: Partial<LocalWorkoutDetail>) => {
    const detailMock: LocalWorkoutDetail = {
      ...mockLocalWorkoutDetails[0],
      setOrder: 2,
      workoutId: 1,
      isDone: false,
      reps: 10,
      weight: 100,
      ...detail,
    };
    const loadDetailsMock = jest.fn();
    customRender(
      <table>
        <tbody>
          <WorkoutItem
            loadLocalWorkoutDetails={loadDetailsMock}
            workoutDetail={detailMock}
          />
        </tbody>
      </table>
    );
    return {
      loadDetailsMock,
    };
  };
  describe("workoutDetail이 올바르게 렌더링된다", () => {
    it("setOrder 가 올바르게 표시된다", () => {
      renderWorkoutItem();
      const setOrder = screen.getByTestId("setOrder");
      expect(setOrder).toHaveTextContent("2");
    });

    it("weight 가 올바르게 표시된다", () => {
      renderWorkoutItem();
      const weight = screen.getByTestId("weight");
      expect(weight).toHaveValue("100");
    });
    it("reps 가 올바르게 표시된다", () => {
      renderWorkoutItem();
      const reps = screen.getByTestId("reps");
      expect(reps).toHaveValue("10");
    });

    it("isDone이 true일 경우 Checkbox가 체크된다", () => {
      renderWorkoutItem({ isDone: true });
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
    it("isDone이 false일 경우 Checkbox가 체크되지 않는다", () => {
      renderWorkoutItem();
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("update workout detail", () => {
    it("weight input에서 blur 이벤트가 일어나면 updateLocalWorkoutDetail 과 updateLocalWorkoutDetail이 호출된다", async () => {
      const { loadDetailsMock } = renderWorkoutItem();
      const weightInput = screen.getByTestId("weight");

      await userEvent.type(weightInput, "{backspace}{backspace} 30");
      await userEvent.tab();
      expect(updateLocalWorkoutDetail).toHaveBeenCalledWith({
        weight: 130,
        id: 1,
      });
      expect(loadDetailsMock).toHaveBeenCalledTimes(1);
    });
    it("reps input에서 blur 이벤트가 일어나면 updateLocalWorkoutDetail 과 updateLocalWorkoutDetail이 호출된다", async () => {
      const { loadDetailsMock } = renderWorkoutItem();
      const repsInput = screen.getByTestId("reps");

      await userEvent.type(repsInput, "{backspace}{backspace} 5");
      await userEvent.tab();
      expect(updateLocalWorkoutDetail).toHaveBeenCalledWith({
        reps: 5,
        id: 1,
      });
      expect(loadDetailsMock).toHaveBeenCalledTimes(1);
    });
  });
});
