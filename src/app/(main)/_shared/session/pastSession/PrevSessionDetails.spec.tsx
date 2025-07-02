import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import PrevSessionDetails from "@/app/(main)/_shared/session/pastSession/PrevSessionDetails";
import { render, screen } from "@testing-library/react";

const mockWD = {
  ...mockWorkoutDetail.past,
  exerciseName: "데드리프트",
  rpe: 6,
  weight: 100,
  reps: 10,
};
const mockWD2 = {
  ...mockWorkoutDetail.past,
  exerciseName: "데드리프트",
  rpe: null,
  weight: 110,
  reps: 12,
};

describe("PrevSessionDetails", () => {
  it("prevDetails의 exerciseName이 올바르게 렌더링된다", () => {
    render(<PrevSessionDetails prevDetails={[mockWD, mockWD2]} />);

    expect(screen.getByText("데드리프트")).toBeInTheDocument();
  });

  it("prevDetails의 데이터가 올바르게 렌더링된다", () => {
    render(<PrevSessionDetails prevDetails={[mockWD, mockWD2]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("prevDetails가 빈배열인 경우 렌더링하지 않는다", () => {
    render(<PrevSessionDetails prevDetails={[]} />);

    const listitems = screen.queryAllByRole("listitem");
    expect(listitems).toHaveLength(0);
  });
});
