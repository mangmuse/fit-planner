jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: jest.fn(),
  BottomSheetProvider: ({ children }) => <div>{children}</div>,
}));
import { findByRole, render, screen } from "@testing-library/react";
import BottomSheet from "./BottomSheet";
import {
  BottomSheetProps,
  useBottomSheet,
} from "@/providers/contexts/BottomSheetContext";
import { customRender } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("BottomSheet", () => {
  const mockCloseBottomSheet = jest.fn();
  const portalRoot = document.createElement("div");

  beforeEach(() => {
    (useBottomSheet as jest.Mock).mockReturnValue({
      closeBottomSheet: mockCloseBottomSheet,
    });

    portalRoot.setAttribute("id", "bottom-sheet-portal");
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    document.body.removeChild(portalRoot);
    jest.clearAllMocks();
  });

  const renderBottomSheet = ({
    isOpen = true,
    height = 0,
    minHeight = 0,
    onClose = jest.fn(),
    onExitComplete = jest.fn(),
    children = <div>테스트 컨텐츠</div>,
  }: Partial<BottomSheetProps> = {}) => {
    customRender(
      <BottomSheet
        isOpen={isOpen}
        height={height}
        minHeight={minHeight}
        onClose={onClose}
        onExitComplete={onExitComplete}
      >
        {children}
      </BottomSheet>
    );
    return { onClose, onExitComplete };
  };

  describe("BottomSheet 가 올바르게 렌더링된다", () => {
    it("전달받은 minHeight과 height이 올바르게 적용된다", async () => {
      renderBottomSheet({ height: 500, minHeight: 300 });
      const bottomSheet = await screen.findByRole("dialog");

      expect(bottomSheet).toHaveStyle({
        height: "500px",
        minHeight: "300px",
      });
    });

    it("백드롭에 bg-black/30 z-40 클래스가 적용된다", async () => {
      renderBottomSheet();
      const backdrop = await screen.findByRole("presentation");

      expect(backdrop).toHaveClass("bg-black/30 z-40");
    });
  });

  it("백드롭을 클릭시 onClose와 closeBottomSheet이 실행된다", async () => {
    const { onClose } = renderBottomSheet();
    const backdrop = await screen.findByRole("presentation");

    await userEvent.click(backdrop);

    expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("닫기버튼 클릭시 onClose와 closeBottomSheet이 실행된다", async () => {
    const { onClose } = renderBottomSheet();
    const closeBtn = await screen.findByRole("button", {
      name: "바텀시트 닫기",
    });
    expect(closeBtn).toBeInTheDocument();

    await userEvent.click(closeBtn);
    expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
