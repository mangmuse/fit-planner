jest.mock("@/providers/contexts/ModalContext");

import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SessionTableHeader from "./SessionTableHeader";
import { useModal } from "@/providers/contexts/ModalContext";
import {
  LocalExercise,
  LocalWorkoutDetail,
  LocalRoutineDetail,
  Saved,
} from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseModal = jest.mocked(useModal);

describe("SessionTableHeader", () => {
  const mockOpenModal = jest.fn();

  const mockPrevDetails: LocalWorkoutDetail[] = [
    { ...mockWorkoutDetail.past, id: 1 },
    { ...mockWorkoutDetail.past, id: 2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
      showError: jest.fn(),
      isOpen: false,
    });
  });

  const renderSessionTableHeader = (props?: {
    prevDetails?: LocalWorkoutDetail[];
    detail?: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>;
    isRoutine?: boolean;
  }) => {
    const defaultProps = {
      prevDetails: mockPrevDetails,
      detail: { ...mockPrevDetails[0], id: 1 },
      isRoutine: false,
    };
    render(<SessionTableHeader {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("테이블 헤더가 올바르게 렌더링된다", () => {
      renderSessionTableHeader();

      expect(screen.getByTestId("session-table-header")).toBeInTheDocument();
      expect(screen.getByText("Set")).toBeInTheDocument();
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Reps")).toBeInTheDocument();
    });

    it("exercise.unit이 lbs일 때 lbs가 표시된다", () => {
      const detailWithLbs = {
        ...mockPrevDetails[0],
        id: 1,
        weightUnit: "lbs" as const,
      };
      renderSessionTableHeader({ detail: detailWithLbs });

      expect(screen.getByText("lbs")).toBeInTheDocument();
    });

    it("detail.weightUnit이 kg일 때 kg가 표시된다", () => {
      const detailWithKg = {
        ...mockPrevDetails[0],
        id: 1,
        weightUnit: "kg" as const,
      };
      renderSessionTableHeader({ detail: detailWithKg });

      expect(screen.getByText("kg")).toBeInTheDocument();
    });

    it("isRoutine=false일 때 delete 아이콘이 표시되지 않는다", () => {
      renderSessionTableHeader({ isRoutine: false });

      expect(screen.queryByAltText("delete")).not.toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    it("prevDetails가 있을 때 Previous 클릭하면 모달이 열린다", async () => {
      const user = userEvent.setup();
      renderSessionTableHeader({ prevDetails: mockPrevDetails });

      const previousHeader = screen.getByText("Previous");
      await user.click(previousHeader);

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
      expect(mockOpenModal).toHaveBeenCalledWith({
        type: "generic",
        children: expect.anything(),
      });
    });

    it("prevDetails가 비어있을 때 Previous 클릭해도 모달이 열리지 않는다", async () => {
      const user = userEvent.setup();
      renderSessionTableHeader({ prevDetails: [] });

      const previousHeader = screen.getByText("Previous");
      await user.click(previousHeader);

      expect(mockOpenModal).not.toHaveBeenCalled();
    });
  });
});
