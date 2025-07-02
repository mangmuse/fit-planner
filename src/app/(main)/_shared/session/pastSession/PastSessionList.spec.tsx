import { mockWorkout } from "@/__mocks__/workout.mock";
import PastSessionList from "@/app/(main)/_shared/session/pastSession/PastSessionList";
import { render, screen } from "@testing-library/react";

const mockWorkout1 = {
  ...mockWorkout.synced,
  id: 1,
  date: "2025-02-11",
};

const mockWorkout2 = {
  ...mockWorkout.synced,
  id: 2,
  date: "2025-02-10",
};

describe("PastSessionList", () => {
  it("pastWorkouts의 데이터가 올바르게 렌더링된다", () => {
    render(<PastSessionList pastWorkouts={[mockWorkout1, mockWorkout2]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("pastWorkouts가 빈배열인 경우 안내 메시지가 표시된다", () => {
    render(<PastSessionList pastWorkouts={[]} />);

    expect(
      screen.getByText("불러올 수 있는 운동 기록이 없습니다")
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
