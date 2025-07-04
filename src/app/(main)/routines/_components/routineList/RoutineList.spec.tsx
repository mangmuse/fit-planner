import { render, screen, waitFor } from "@testing-library/react";
import RoutineList from "./RoutineList";
import { mockRoutine } from "@/__mocks__/routine.mock";
import { routineService } from "@/lib/di";
import { LocalRoutine } from "@/types/models";

jest.mock("@/lib/di");

const mockedRoutineService = jest.mocked(routineService);

describe("RoutineList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("렌더링", () => {
    it("로딩 중일 때 로딩 상태를 표시한다", () => {
      mockedRoutineService.getAllLocalRoutines.mockReturnValue(
        new Promise(() => {})
      );
      render(<RoutineList />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("루틴 목록을 올바르게 렌더링한다", async () => {
      const mockRoutines: LocalRoutine[] = [
        { ...mockRoutine.synced, id: 1, name: "루틴 1" },
        { ...mockRoutine.synced, id: 2, name: "루틴 2" },
      ];
      mockedRoutineService.getAllLocalRoutines.mockResolvedValue(mockRoutines);

      render(<RoutineList />);

      await waitFor(() => {
        expect(screen.getByText("루틴 1")).toBeInTheDocument();
        expect(screen.getByText("루틴 2")).toBeInTheDocument();
      });
    });

    it("루틴이 없을 때 빈 상태를 표시한다", async () => {
      mockedRoutineService.getAllLocalRoutines.mockResolvedValue([]);

      render(<RoutineList />);

      await waitFor(() => {
        expect(screen.getByText("아직 루틴이 없습니다")).toBeInTheDocument();
      });
    });

    it("에러 발생 시 에러 상태를 표시한다", async () => {
      const MOCK_ERROR = new Error("DB에서 에러 발생");
      mockedRoutineService.getAllLocalRoutines.mockRejectedValue(MOCK_ERROR);

      render(<RoutineList />);

      await waitFor(() => {
        expect(screen.getByText(MOCK_ERROR.message)).toBeInTheDocument();
      });
    });
  });
});
