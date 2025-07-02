import { mockExercise } from "@/__mocks__/exercise.mock";
import DailyMemoContent, {
  DailyMemoContentProps,
} from "@/app/(main)/_shared/session/exerciseMemo/DailyMemoContent";
import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise } from "@/types/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/di");
jest.mock("@/providers/contexts/ModalContext");

const mockedUseModal = jest.mocked(useModal);
const mockedExerciseService = jest.mocked(exerciseService);

const mockPrevMemo1: NonNullable<LocalExercise["exerciseMemo"]>["daily"][0] = {
  date: "2025-01-01",
  content: "테스트 메모",
  createdAt: new Date("2025-01-01").toISOString(),
  updatedAt: null,
};
const mockPrevMemo2: NonNullable<LocalExercise["exerciseMemo"]>["daily"][0] = {
  date: "2025-01-02",
  content: "테스트 메모2",
  createdAt: new Date("2025-01-02").toISOString(),
  updatedAt: null,
};
const mockPrevMemos: NonNullable<LocalExercise["exerciseMemo"]>["daily"] = [
  mockPrevMemo1,
  mockPrevMemo2,
];
const mockExistingMemo: LocalExercise["exerciseMemo"] = {
  fixed: null,
  daily: mockPrevMemos,
};
const mockEx: LocalExercise = {
  ...mockExercise.bookmarked,
  exerciseMemo: mockExistingMemo,
  id: 500,
};

describe("DailyMemoContent", () => {
  const reloadExercises = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModal.mockReturnValue({
      showError: mockShowError,
      closeModal: jest.fn(),
      openModal: jest.fn(),
      isOpen: false,
    });
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const renderDailyMemoContent = (props?: Partial<DailyMemoContentProps>) => {
    render(
      <DailyMemoContent
        exercise={mockEx}
        dailyMemos={mockPrevMemos}
        loadExercises={reloadExercises}
        {...props}
      />
    );
  };

  describe("렌더링", () => {
    it("최초 렌더링시 오늘 메모 작성 버튼이 표시된다", () => {
      renderDailyMemoContent();

      expect(screen.getByText("+ 오늘 메모 작성")).toBeInTheDocument();
    });

    it("메모 목록이 올바르게 렌더링 된다", () => {
      renderDailyMemoContent();

      expect(screen.getByText(mockPrevMemo1.content)).toBeInTheDocument();
      expect(screen.getByText(mockPrevMemo2.content)).toBeInTheDocument();
    });
  });

  describe("상호작용", () => {
    it("오늘 메모 작성 버튼을 클릭하면 메모 작성 모달이 표시된다", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderDailyMemoContent();

      const addMemoButton = screen.getByText("+ 오늘 메모 작성");
      expect(addMemoButton).toBeInTheDocument();

      await user.click(addMemoButton);

      const textarea =
        screen.getByPlaceholderText("오늘의 특이사항을 기록하세요");

      expect(textarea).toBeInTheDocument();
      expect(addMemoButton).not.toBeInTheDocument();
    });

    it("메모 작성 모달에서 메모를 작성하고 저장 버튼을 클릭하면 오늘자 메모가 추가된다", async () => {
      const MOCK_TODAY = new Date("2025-04-15T12:00:00.000Z");
      jest.setSystemTime(MOCK_TODAY);
      mockedExerciseService.updateLocalExercise.mockResolvedValue(mockEx.id!);

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderDailyMemoContent();

      const addMemoButton = screen.getByText("+ 오늘 메모 작성");
      await user.click(addMemoButton);

      const textarea =
        screen.getByPlaceholderText("오늘의 특이사항을 기록하세요");
      await user.type(textarea, "테스트 메모3");

      const saveButton = screen.getByText("저장");
      await user.click(saveButton);

      expect(mockedExerciseService.updateLocalExercise).toHaveBeenCalledWith({
        ...mockEx,
        exerciseMemo: {
          fixed: null,
          daily: [
            mockPrevMemo1,
            mockPrevMemo2,
            {
              date: "2025-04-15",
              content: "테스트 메모3",
              createdAt: MOCK_TODAY.toISOString(),
              updatedAt: null,
            },
          ],
        },
      });

      expect(screen.getByText(mockPrevMemo1.content)).toBeInTheDocument();
      expect(screen.getByText(mockPrevMemo2.content)).toBeInTheDocument();

      expect(reloadExercises).toHaveBeenCalled();
    });

    it("오늘자 메모가 있어도 새로운 메모가 추가된다", async () => {
      const MOCK_EXISTING_TIME = new Date("2025-04-15T11:00:00.000Z");
      const MOCK_NEW_TIME = new Date("2025-04-15T12:00:00.000Z");
      jest.setSystemTime(MOCK_NEW_TIME);
      const mockMemos = [
        {
          ...mockPrevMemo1,
          date: "2025-04-15",
          createdAt: MOCK_EXISTING_TIME.toISOString(),
          updatedAt: null,
        },
      ];
      const mockExerciseWithTodayMemo = {
        ...mockEx,
        exerciseMemo: {
          fixed: null,
          daily: mockMemos,
        },
      };
      mockedExerciseService.updateLocalExercise.mockResolvedValue(mockEx.id!);

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderDailyMemoContent({
        exercise: mockExerciseWithTodayMemo,
        dailyMemos: mockMemos,
      });

      const addMemoButton = screen.getByText("+ 오늘 메모 작성");
      await user.click(addMemoButton);

      const textarea =
        screen.getByPlaceholderText("오늘의 특이사항을 기록하세요");
      const saveButton = screen.getByText("저장");

      await user.type(textarea, "테스트 메모222");
      await user.click(saveButton);

      expect(screen.getByText(mockMemos[0].content)).toBeInTheDocument();
      expect(mockedExerciseService.updateLocalExercise).toHaveBeenCalledWith({
        ...mockExerciseWithTodayMemo,
        exerciseMemo: {
          fixed: null,
          daily: [
            {
              date: "2025-04-15",
              content: "테스트 메모",
              createdAt: MOCK_EXISTING_TIME.toISOString(),
              updatedAt: null,
            },
            {
              date: "2025-04-15",
              content: "테스트 메모222",
              createdAt: MOCK_NEW_TIME.toISOString(),
              updatedAt: null,
            },
          ],
        },
      });

      expect(reloadExercises).toHaveBeenCalled();
    });

    it("메모 추가 도중 에러가 발생하면 에러 모달이 표시되어야 한다", async () => {
      const mockError = new Error("메모 저장 실패");
      const MOCK_NEW_TIME = new Date("2025-04-15T12:00:00.000Z");
      jest.setSystemTime(MOCK_NEW_TIME);
      mockedExerciseService.updateLocalExercise.mockRejectedValue(mockError);

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderDailyMemoContent();

      const addMemoButton = screen.getByText("+ 오늘 메모 작성");
      await user.click(addMemoButton);

      const textarea =
        screen.getByPlaceholderText("오늘의 특이사항을 기록하세요");
      const saveButton = screen.getByText("저장");

      await user.type(textarea, "테스트 메모33333");
      await user.click(saveButton);

      expect(mockedExerciseService.updateLocalExercise).toHaveBeenCalledWith({
        ...mockEx,
        exerciseMemo: {
          fixed: null,
          daily: [
            mockPrevMemo1,
            mockPrevMemo2,
            {
              date: "2025-04-15",
              content: "테스트 메모33333",
              createdAt: MOCK_NEW_TIME.toISOString(),
              updatedAt: null,
            },
          ],
        },
      });
      expect(mockShowError).toHaveBeenCalledWith("메모 저장에 실패했습니다");
      expect(reloadExercises).not.toHaveBeenCalled();
    });
  });
});
