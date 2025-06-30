jest.mock("@/providers/contexts/BottomSheetContext");
jest.mock("@/lib/di");

import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SetOptionSheet from "@/app/(main)/workout/_components/setOptions/SetOptionSheet";
import SetOrderCell, {
  SetOrderCellProps,
} from "@/app/(main)/workout/_components/workoutSet/SetOrderCell";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockUseBottomSheet = jest.mocked(useBottomSheet);

describe("SetOrderCell", () => {
  const mockOpenBottomSheet = jest.fn();
  const mockReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseBottomSheet.mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
      closeBottomSheet: jest.fn(),
      isOpen: false,
    });
  });
  const mockWD = mockWorkoutDetail.past;

  const renderSetOrderCell = (props?: Partial<SetOrderCellProps>) => {
    const defaultProps: SetOrderCellProps = {
      workoutDetail: mockWD,
      loadLocalWorkoutDetails: mockReload,
    };
    render(<SetOrderCell {...defaultProps} {...props} />);
  };

  describe("렌더링", () => {
    it("setType이 NORMAL이면 전달받은 setOrder가 표시된다", () => {
      renderSetOrderCell();

      const setOrder = screen.getByTestId("set-order");
      expect(setOrder).toHaveTextContent(mockWD.setOrder.toString());
    });

    it("setType이 NORMAL이 아니면 전달받은 setType이 표시된다", () => {
      renderSetOrderCell({ workoutDetail: { ...mockWD, setType: "AMRAP" } });
      const setType = screen.getByTestId("set-type");
      screen.debug();
      expect(setType).toHaveTextContent("A");
    });

    it("rpe가 있으면 rpe가 표시된다", () => {
      renderSetOrderCell({ workoutDetail: { ...mockWD, rpe: 5 } });
      const rpe = screen.getByTestId("rpe");
      expect(rpe).toHaveTextContent("5");
    });
  });

  describe("클릭 이벤트", () => {
    it("클릭 시 세트 옵션 시트가 열린다", async () => {
      renderSetOrderCell();
      const setOrder = screen.getByTestId("set-order");
      await userEvent.click(setOrder);

      const { minHeight, children, onClose } =
        mockOpenBottomSheet.mock.calls[0][0];

      expect(minHeight).toBe(150);
      expect(children.type).toBe(SetOptionSheet);
      expect(children.props.workoutDetail).toEqual(mockWD);

      await onClose();
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });
});
