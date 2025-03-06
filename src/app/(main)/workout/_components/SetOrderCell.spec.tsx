jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: jest.fn(),
  BottomSheetProvider: ({ children }) => <div>{children}</div>,
}));

import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import SetOrderCell from "@/app/(main)/workout/_components/SetOrderCell";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { customRender, screen } from "@/test-utils/test-utils";
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

  const renderSetOrderCell = () => {
    customRender(
      <table>
        <tbody>
          <tr>
            <SetOrderCell
              loadLocalWorkoutDetails={loadFnMock}
              workoutDetail={detail}
            />
          </tr>
        </tbody>
      </table>
    );
  };

  it("setOrder를 올바르게 렌더링한다", async () => {
    renderSetOrderCell();
    const setOrderCell = await screen.findByTestId("setOrder");
    expect(setOrderCell).toHaveTextContent(detail.setOrder.toString());
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
