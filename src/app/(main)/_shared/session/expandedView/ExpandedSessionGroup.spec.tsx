import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import ExpandedSessionGroup, {
  ExpandedWorkoutGroupProps,
} from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");

describe("ExpandedSessionGroup", () => {
  const mockOnToggleSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSessionGroup = {
    exerciseOrder: 1,
    details: [
      {
        ...mockWorkoutDetail.past,
        exerciseId: 1,
        exerciseName: "벤치프레스",
        reps: 8,
        weight: 90,
        setOrder: 1,
      },
      {
        ...mockWorkoutDetail.past,
        exerciseId: 1,
        exerciseName: "벤치프레스",
        reps: 7,
        weight: 90,
        setOrder: 2,
      },
    ],
  };
  const renderExpandedSessionGroup = (
    props?: Partial<ExpandedWorkoutGroupProps>
  ) => {
    const defaultProps = {
      sessionGroup: mockSessionGroup,
      isSelected: false,
      onToggleSelect: mockOnToggleSelect,
    };
    render(<ExpandedSessionGroup {...defaultProps} {...props} />);
  };
  describe("렌더링", () => {
    it("올바르게 같은 그룹의 세트가 렌더링된다.", async () => {
      renderExpandedSessionGroup();
      const exerciseName = mockSessionGroup.details[0].exerciseName;
      const setOrder = mockSessionGroup.details[0].setOrder;
      const weightUnit = mockSessionGroup.details[0].weightUnit;

      expect(screen.getByText(`${setOrder}세트`)).toBeInTheDocument();
      expect(screen.getByText(exerciseName)).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(
            `${mockSessionGroup.details[0].weight}${weightUnit} × ${mockSessionGroup.details[0].reps}회`
          )
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            `${mockSessionGroup.details[1].weight}${weightUnit} × ${mockSessionGroup.details[1].reps}회`
          )
        ).toBeInTheDocument();
      });
    });

    it("그룹의 detail 수만큼 ExpandedSessionItem이 렌더링된다", async () => {
      renderExpandedSessionGroup();
      await waitFor(() => {
        expect(screen.getAllByText(/세트/)).toHaveLength(
          mockSessionGroup.details.length
        );
      });
    });

    it("isSelected 가 true이면 체크박스가 체크된다", async () => {
      renderExpandedSessionGroup({ isSelected: true });
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("체크박스를 클릭하면 onToggleSelect가 호출된다", async () => {
      renderExpandedSessionGroup();

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      expect(mockOnToggleSelect).toHaveBeenCalledTimes(1);
      expect(mockOnToggleSelect).toHaveBeenCalledWith(
        mockSessionGroup.details[0].workoutId,
        mockSessionGroup.exerciseOrder
      );
    });
  });
});
