import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BottomSheetProvider,
  useBottomSheet,
} from "@/providers/contexts/BottomSheetContext";

beforeEach(() => {
  const portalContainer = document.createElement("div");
  portalContainer.id = "bottom-sheet-portal";
  document.body.appendChild(portalContainer);
});

afterEach(() => {
  const portalContainer = document.getElementById("bottom-sheet-portal");
  if (portalContainer) {
    document.body.removeChild(portalContainer);
  }
  document.body.style.overflow = "";
});

const BottomSheetTestConsumer = ({ onClose }: { onClose?: () => void }) => {
  const { openBottomSheet, isOpen } = useBottomSheet();

  return (
    <div data-testid={isOpen.toString()}>
      <button
        onClick={() =>
          openBottomSheet({
            children: (
              <div>
                <h3>테스트 바텀시트</h3>
                <p>내용</p>
                <button>버튼</button>
              </div>
            ),
            onClose,
          })
        }
      >
        바텀시트 열기
      </button>

      <button
        onClick={() =>
          openBottomSheet({
            children: (
              <div>
                <h3>높이 설정</h3>
                <p>300px 높이</p>
              </div>
            ),
            height: "300px",
            minHeight: 200,
            onClose,
          })
        }
      >
        높이 설정 바텀시트 열기
      </button>
    </div>
  );
};

describe("BottomSheetProvider and useBottomSheet hook", () => {
  const mockOnClose = jest.fn();
  const user = userEvent.setup();

  const renderBottomSheetProvider = (overrides?: { onClose?: () => void }) => {
    const defaultProps = {
      onClose: mockOnClose,
      ...overrides,
    };

    return render(
      <BottomSheetProvider>
        <BottomSheetTestConsumer {...defaultProps} />
      </BottomSheetProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("기본 바텀시트 동작", () => {
    it("바텀시트가 열리고 컨텐츠가 렌더링되어야 한다", async () => {
      renderBottomSheetProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "바텀시트 열기" }));

      expect(screen.getByTestId("true")).toBeInTheDocument();
      expect(screen.getByText("테스트 바텀시트")).toBeInTheDocument();
      expect(screen.getByText("내용")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "버튼" })).toBeInTheDocument();
    });

    it("닫기 버튼을 누르면 바텀시트가 닫혀야 한다", async () => {
      renderBottomSheetProvider();

      await user.click(screen.getByRole("button", { name: "바텀시트 열기" }));

      expect(screen.getByTestId("true")).toBeInTheDocument();
      expect(screen.getByText("테스트 바텀시트")).toBeInTheDocument();

      const closeButton = screen.getByRole("button", { name: "바텀시트 닫기" });
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("false")).toBeInTheDocument();
    });

    it("배경을 클릭하면 바텀시트가 닫혀야 한다", async () => {
      renderBottomSheetProvider();

      await user.click(screen.getByRole("button", { name: "바텀시트 열기" }));

      expect(screen.getByTestId("true")).toBeInTheDocument();

      const backdrop = screen.getByRole("presentation");
      expect(backdrop).toBeInTheDocument();

      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("false")).toBeInTheDocument();
    });
  });

  describe("바텀시트 옵션", () => {
    it("높이와 최소높이가 설정된 바텀시트가 렌더링되어야 한다", async () => {
      renderBottomSheetProvider();

      await user.click(
        screen.getByRole("button", { name: "높이 설정 바텀시트 열기" })
      );

      expect(screen.getByTestId("true")).toBeInTheDocument();
      expect(screen.getByText("높이 설정")).toBeInTheDocument();
      expect(screen.getByText("300px 높이")).toBeInTheDocument();

      const bottomSheetDialog = screen.getByRole("dialog");
      expect(bottomSheetDialog).toHaveStyle({ height: "300px" });
    });
  });

  describe("Hook Functions", () => {
    it("openBottomSheet 함수가 바텀시트를 열어야 한다", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetProvider>{children}</BottomSheetProvider>
      );

      const { result } = renderHook(() => useBottomSheet(), { wrapper });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.openBottomSheet({
          children: <div>테스트</div>,
        });
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("closeBottomSheet 함수가 바텀시트를 닫아야 한다", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <BottomSheetProvider>{children}</BottomSheetProvider>
      );

      const { result } = renderHook(() => useBottomSheet(), { wrapper });

      act(() => {
        result.current.openBottomSheet({
          children: <div>테스트</div>,
        });
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeBottomSheet();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("브라우저 뒤로가기 이벤트", () => {
    it("뒤로가기 시 바텀시트가 닫혀야 한다", async () => {
      renderBottomSheetProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "바텀시트 열기" }));

      expect(screen.getByTestId("true")).toBeInTheDocument();
      expect(screen.getByText("테스트 바텀시트")).toBeInTheDocument();

      fireEvent.popState(window);

      expect(screen.getByTestId("false")).toBeInTheDocument();
    });

    it("바텀시트가 닫힌 상태에서 뒤로가기해도 문제없어야 한다", () => {
      renderBottomSheetProvider();

      expect(screen.getByTestId("false")).toBeInTheDocument();

      fireEvent.popState(window);

      expect(screen.getByTestId("false")).toBeInTheDocument();
    });
  });
});
