import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import SetOptionSheet from "@/app/(main)/_shared/session/setOptions/SetOptionSheet";
import { routineDetailService, workoutDetailService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");

const mockWD: LocalWorkoutDetail = {
  ...mockWorkoutDetail.past,
  setType: "WARMUP",
  rpe: 7,
};
const mockRD: LocalRoutineDetail = {
  ...mockRoutineDetail.past,
  setType: "WARMUP",
  rpe: 7,
};
const mockUseModal = jest.mocked(useModal);
const mockWorkoutDetailService = jest.mocked(workoutDetailService);
const mockRoutineDetailService = jest.mocked(routineDetailService);

describe("SetOptionSheet", () => {
  const mockShowError = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModal.mockReturnValue({
      showError: mockShowError,
      openModal: jest.fn(),
      closeModal: jest.fn(),
      isOpen: false,
    });
  });

  const renderSetOptionSheet = (
    detail?: LocalWorkoutDetail | LocalRoutineDetail
  ) => {
    render(<SetOptionSheet detail={detail ?? mockWD} />);
  };

  describe("렌더링", () => {
    it("RPE와 세트타입이 올바르게 렌더링되어야 한다", () => {
      renderSetOptionSheet(mockWD);

      const selectedType = screen.getByRole("tab", { name: "웜업세트" });
      const SelectedRPE = screen.getByRole("tab", { name: "7" });

      const unSelectedSetType = screen.getByRole("tab", { name: "드롭세트" });
      const unSelectedRPE = screen.getByRole("tab", { name: "5" });

      // 활성화
      expect(selectedType).toBeInTheDocument();
      expect(selectedType).toHaveAttribute("aria-selected", "true");

      expect(SelectedRPE).toBeInTheDocument();
      expect(SelectedRPE).toHaveAttribute("aria-selected", "true");

      // 비활성화
      expect(unSelectedSetType).toBeInTheDocument();
      expect(unSelectedSetType).toHaveAttribute("aria-selected", "false");

      expect(unSelectedRPE).toBeInTheDocument();
      expect(unSelectedRPE).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();

    describe("detail이 workoutDetail", () => {
      it("비활성화 된 세트타입을 클릭하면 해당 세트타입으로 변경된다", async () => {
        renderSetOptionSheet(mockWD);

        const selectedType = screen.getByRole("tab", { name: "웜업세트" });
        const toBeSelected = screen.getByRole("tab", { name: "드롭세트" });
        await user.click(toBeSelected);

        expect(selectedType).toHaveAttribute("aria-selected", "false");
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({
          ...mockWD,
          setType: "DROP",
        });

        // 기존 세트타입 비활성화
        expect(selectedType).toHaveAttribute("aria-selected", "false");

        // 반대 로직은 실행되지 않음
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();
      });

      it("활성화 되어있는 세트타입을 클릭하면 업데이트 되지 않는다", async () => {
        renderSetOptionSheet(mockWD);

        const selectedType = screen.getByRole("tab", { name: "웜업세트" });
        await user.click(selectedType);

        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();

        expect(selectedType).toHaveAttribute("aria-selected", "true");
      });

      it("비활성화 된 RPE를 클릭하면 해당 RPE로 변경된다", async () => {
        renderSetOptionSheet(mockWD);

        const selectedRPE = screen.getByRole("tab", { name: "7" });
        const toBeSelected = screen.getByRole("tab", { name: "5" });
        await user.click(toBeSelected);

        expect(selectedRPE).toHaveAttribute("aria-selected", "false");
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).toHaveBeenCalledWith({
          ...mockWD,
          rpe: 5,
        });

        // 기존 RPE 비활성화
        expect(selectedRPE).toHaveAttribute("aria-selected", "false");

        // 반대 로직은 실행되지 않음
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();
      });

      it("활성화 되어있는 RPE를 클릭하면 업데이트 되지 않는다", async () => {
        renderSetOptionSheet(mockWD);

        const selectedRPE = screen.getByRole("tab", { name: "7" });
        await user.click(selectedRPE);

        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();

        expect(selectedRPE).toHaveAttribute("aria-selected", "true");
      });

      it("세트타입 업데이트 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
        const mockError = new Error("업데이트 실패");
        mockWorkoutDetailService.updateLocalWorkoutDetail.mockRejectedValue(
          mockError
        );

        renderSetOptionSheet(mockWD);

        const toBeSelected = screen.getByRole("tab", { name: "드롭세트" });
        await user.click(toBeSelected);

        expect(mockShowError).toHaveBeenCalledWith("업데이트에 실패헀습니다");

        // 상태는 변경된다
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
      });

      it("RPE 업데이트 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
        const mockError = new Error("RPE 업데이트 실패");
        mockWorkoutDetailService.updateLocalWorkoutDetail.mockRejectedValue(
          mockError
        );

        renderSetOptionSheet(mockWD);

        const toBeSelected = screen.getByRole("tab", { name: "5" });
        await user.click(toBeSelected);

        expect(mockShowError).toHaveBeenCalledWith("업데이트에 실패헀습니다");

        // 상태는 변경된다
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
      });
    });

    describe("detail이 routineDetail", () => {
      it("비활성화 된 세트타입을 클릭하면 해당 세트타입으로 변경된다", async () => {
        renderSetOptionSheet(mockRD);

        const selectedType = screen.getByRole("tab", { name: "웜업세트" });
        const toBeSelected = screen.getByRole("tab", { name: "드롭세트" });
        await user.click(toBeSelected);

        expect(selectedType).toHaveAttribute("aria-selected", "false");
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).toHaveBeenCalledWith({
          ...mockRD,
          setType: "DROP",
        });

        // 기존 세트타입 비활성화
        expect(selectedType).toHaveAttribute("aria-selected", "false");

        // 반대 로직은 실행되지 않음
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();
      });

      it("활성화 되어있는 세트타입을 클릭하면 업데이트 되지 않는다", async () => {
        renderSetOptionSheet(mockRD);

        const selectedType = screen.getByRole("tab", { name: "웜업세트" });
        await user.click(selectedType);

        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();

        expect(selectedType).toHaveAttribute("aria-selected", "true");
      });

      it("비활성화 된 RPE를 클릭하면 해당 RPE로 변경된다", async () => {
        renderSetOptionSheet(mockRD);

        const selectedRPE = screen.getByRole("tab", { name: "7" });
        const toBeSelected = screen.getByRole("tab", { name: "5" });
        await user.click(toBeSelected);

        expect(selectedRPE).toHaveAttribute("aria-selected", "false");
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).toHaveBeenCalledWith({
          ...mockRD,
          rpe: 5,
        });

        // 기존 RPE 비활성화
        expect(selectedRPE).toHaveAttribute("aria-selected", "false");

        // 반대 로직은 실행되지 않음
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();
      });

      it("활성화 되어있는 RPE를 클릭하면 업데이트 되지 않는다", async () => {
        renderSetOptionSheet(mockRD);

        const selectedRPE = screen.getByRole("tab", { name: "7" });
        await user.click(selectedRPE);

        expect(
          mockRoutineDetailService.updateLocalRoutineDetail
        ).not.toHaveBeenCalled();
        expect(
          mockWorkoutDetailService.updateLocalWorkoutDetail
        ).not.toHaveBeenCalled();

        expect(selectedRPE).toHaveAttribute("aria-selected", "true");
      });

      it("세트타입 업데이트 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
        const mockError = new Error("업데이트 실패");
        mockRoutineDetailService.updateLocalRoutineDetail.mockRejectedValue(
          mockError
        );

        renderSetOptionSheet(mockRD);

        const toBeSelected = screen.getByRole("tab", { name: "드롭세트" });
        await user.click(toBeSelected);

        expect(mockShowError).toHaveBeenCalledWith("업데이트에 실패헀습니다");

        // 상태는 변경된다
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
      });

      it("RPE 업데이트 도중 에러가 발생하면 에러 모달이 표시된다", async () => {
        const mockError = new Error("RPE 업데이트 실패");
        mockRoutineDetailService.updateLocalRoutineDetail.mockRejectedValue(
          mockError
        );

        renderSetOptionSheet(mockRD);

        const toBeSelected = screen.getByRole("tab", { name: "5" });
        await user.click(toBeSelected);

        expect(mockShowError).toHaveBeenCalledWith("업데이트에 실패헀습니다");

        // 상태는 변경된다
        expect(toBeSelected).toHaveAttribute("aria-selected", "true");
      });
    });
  });
});
