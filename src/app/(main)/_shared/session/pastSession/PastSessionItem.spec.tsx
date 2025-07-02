import { mockWorkout } from "@/__mocks__/workout.mock";
import ExpandedSessionDetailsView from "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView";
import PastSessionItem from "@/app/(main)/_shared/session/pastSession/PastSessionItem";
import { LocalWorkout } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock(
  "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView",
  () =>
    jest.fn(({ workoutId }) => (
      <div data-testid="mock-expanded-session-details-view">
        workoutId: {workoutId}
      </div>
    ))
);

const MockExpandedSessionDetailsView = jest.mocked(ExpandedSessionDetailsView);

const mockW = { ...mockWorkout.planned, date: "2025-02-10", id: 5296 };

describe("PastSessionItem", () => {
  const renderPastSessionItem = (workout?: LocalWorkout) => {
    render(<PastSessionItem workout={workout ?? mockW} />);
  };

  describe("렌더링", () => {
    it("workout의 데이터가 올바르게 렌더링되어야 한다", () => {
      renderPastSessionItem();

      expect(screen.getByRole("button")).toHaveTextContent("2025-02-10");
    });

    it("ExpandedSessionDetailsView에 workoutId가 전달된다", async () => {
      renderPastSessionItem();

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(screen.getByText(`workoutId: ${mockW.id}`)).toBeInTheDocument();
    });

    it("최초 렌더링시 펼쳐지지 않는다", () => {
      renderPastSessionItem();

      expect(MockExpandedSessionDetailsView).not.toHaveBeenCalled();
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();

    it("아이템을 클릭하면 펼쳐진다", async () => {
      renderPastSessionItem();

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByText(`workoutId: ${mockW.id}`)).toBeInTheDocument();
      expect(
        screen.getByTestId("mock-expanded-session-details-view")
      ).toBeInTheDocument();
    });

    it("펼쳐져있는 상태에서 아이템을 클릭하면 펼쳐진 상태가 해제된다", async () => {
      renderPastSessionItem();

      const button = screen.getByRole("button");
      await user.click(button);

      expect(
        screen.getByTestId("mock-expanded-session-details-view")
      ).toBeInTheDocument();

      await user.click(button);

      expect(
        screen.queryByTestId("mock-expanded-session-details-view")
      ).not.toBeInTheDocument();
    });
  });
});
