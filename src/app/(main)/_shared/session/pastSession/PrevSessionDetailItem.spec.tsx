import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import PrevSessionDetailItem from "@/app/(main)/_shared/session/pastSession/PrevSessionDetailItem";
import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";

const mockWD = {
  ...mockWorkoutDetail.past,
  exerciseName: "데드리프트",
  rpe: 6,
  weight: 100,
  reps: 10,
};

describe("PrevSessionDetailItem", () => {
  it("detail의 데이터가 올바르게 렌더링된다", () => {
    render(<PrevSessionDetailItem detail={mockWD} index={5} />);

    expect(screen.getByTestId("weight-reps")).toHaveTextContent("100 x 10");
    expect(screen.getByTestId("rpe")).toHaveTextContent("RPE 6");
    expect(screen.getByTestId("set-order")).toHaveTextContent("6");
  });

  it("rpe가 null인 경우 rpe 렌더링하지 않는다", () => {
    const mockWdWithoutRpe = {
      ...mockWD,
      rpe: null,
    };
    render(<PrevSessionDetailItem detail={mockWdWithoutRpe} index={5} />);

    expect(screen.queryByTestId("rpe")).not.toBeInTheDocument();
  });
});
