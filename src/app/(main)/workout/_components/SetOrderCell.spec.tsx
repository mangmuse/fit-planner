jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: jest.fn(),
  BottomSheetProvider: ({ children }) => <div>{children}</div>,
}));

import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import SetOrderCell from "@/app/(main)/workout/_components/SetOrderCell";
import {
  RPE_OPTIONS,
  SET_TYPES,
  WorkoutSetType,
} from "@/app/(main)/workout/constants";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { customRender, screen } from "@/test-utils/test-utils";
import { LocalWorkoutDetail } from "@/types/models";
import userEvent from "@testing-library/user-event";

describe("SetOrderCell", () => {
  const mockOpenBottomSheet = jest.fn();
  const loadFnMock = jest.fn();

  const detail = { ...mockLocalWorkoutDetails[0], workoutId: 1 };

  beforeEach(() => {
    jest.resetAllMocks();
    (useBottomSheet as jest.Mock).mockReturnValue({
      openBottomSheet: mockOpenBottomSheet,
    });
  });

  const renderSetOrderCell = (detailOption?: Partial<LocalWorkoutDetail>) => {
    customRender(
      <table>
        <tbody>
          <tr>
            <SetOrderCell
              loadLocalWorkoutDetails={loadFnMock}
              workoutDetail={{ ...detail, ...detailOption }}
            />
          </tr>
        </tbody>
      </table>
    );
  };

  describe("setOrder 텍스트를 올바르게 렌더링한다", () => {
    const getTextColorClass = (setType: LocalWorkoutDetail["setType"]) => {
      const setTypeData = SET_TYPES.find((type) => type.value === setType);
      return setTypeData?.textColor;
    };

    it("setType이 NORMAL인 경우 setOrder를 그대로 출력한다", async () => {
      renderSetOrderCell();
      const setOrderCell = await screen.findByTestId("setOrder");
      expect(setOrderCell).toHaveTextContent(detail.setOrder.toString());
    });

    it('setType이 WARMUP 인 경우 "W" 를 출력하며 지정된 텍스트 색상 클래스를 가진다', async () => {
      renderSetOrderCell({ setType: "WARMUP" });
      const setOrderCell = await screen.findByTestId("setOrder");
      const textColor = getTextColorClass("WARMUP");

      expect(textColor).toBeDefined();
      expect(setOrderCell).toHaveTextContent("W");
      expect(setOrderCell).toHaveClass(textColor!);
    });

    it('setType이 DROP 인 경우 "D" 를 출력하며 지정된 텍스트 색상 클래스를 가진다', async () => {
      renderSetOrderCell({ setType: "DROP" });
      const setOrderCell = await screen.findByTestId("setOrder");
      const textColor = getTextColorClass("DROP");

      expect(textColor).toBeDefined();
      expect(setOrderCell).toHaveTextContent("D");
      expect(setOrderCell).toHaveClass(textColor!);
    });

    it('setType이 FAILURE 인 경우 "F" 를 출력하며 지정된 텍스트 색상 클래스를 가진다', async () => {
      renderSetOrderCell({ setType: "FAILURE" });
      const setOrderCell = await screen.findByTestId("setOrder");
      const textColor = getTextColorClass("FAILURE");

      expect(textColor).toBeDefined();
      expect(setOrderCell).toHaveTextContent("F");
      expect(setOrderCell).toHaveClass(textColor!);
    });

    it('setType이 AMRAP 인 경우 "A" 를 출력하며 지정된 텍스트 색상 클래스를 가진다', async () => {
      renderSetOrderCell({ setType: "AMRAP" });
      const setOrderCell = await screen.findByTestId("setOrder");
      const textColor = getTextColorClass("AMRAP");

      expect(textColor).toBeDefined();
      expect(setOrderCell).toHaveTextContent("A");
      expect(setOrderCell).toHaveClass(textColor!);
    });
  });

  it("rpe가 null이 아닌경우 렌더링하며 지정된 텍스트 색상 클래스가 적용된다", async () => {
    renderSetOrderCell({ rpe: 7 });
    const rpe = await screen.findByTestId("rpe");
    const textColor = RPE_OPTIONS.find((option) => option.value === 7)
      ?.activeTextColor;

    expect(textColor).toBeDefined();
    expect(rpe).toHaveTextContent("7");
    expect(rpe).toHaveClass(textColor!);
  });

  it("rpe가 null인 경우 아무것도 렌더링되지 않는다", async () => {
    renderSetOrderCell();
    const rpe = screen.queryByTestId("rpe");
    expect(rpe).not.toBeInTheDocument();
  });

  it("클릭시 openBottomSheet이 올바르게 호출된다", async () => {
    renderSetOrderCell();
    const setOrderCell = await screen.findByTestId("setOrder");

    await userEvent.click(setOrderCell);
    expect(mockOpenBottomSheet).toHaveBeenCalledWith({
      onClose: loadFnMock,
      minHeight: 150,
      children: expect.anything(),
    });
  });
});
