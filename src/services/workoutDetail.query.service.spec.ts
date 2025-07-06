import { mock } from "node:test";
import { createMockWorkoutRepository } from "@/__mocks__/repositories/workout.repository.mock";
import { createMockWorkoutDetailRepository } from "@/__mocks__/repositories/workoutDetail.repository.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { WorkoutDetailQueryService } from "@/services/workoutDetail.query.service";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { IWorkoutDetailQueryService } from "@/types/services";

const mockRepository = createMockWorkoutDetailRepository();
const mockWorkoutRepository = createMockWorkoutRepository();

describe("WorkoutDetailQueryService", () => {
  let service: IWorkoutDetailQueryService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WorkoutDetailQueryService(
      mockRepository,
      mockWorkoutRepository
    );
  });

  const workoutId = 10;
  const exerciseOrder = 5;
  describe("getWorkoutGroupByWorkoutDetail", () => {
    const detail: Saved<LocalWorkoutDetail> = {
      ...mockWorkoutDetail.past,
      exerciseOrder,
      workoutId,
    };
    it("인자로 전달받은 workoutDetail이 속해있는 그룹을 반환한다", async () => {
      mockRepository.findAllByWorkoutIdAndExerciseOrder.mockResolvedValue([
        detail,
      ]);

      service.getWorkoutGroupByWorkoutDetail(detail);

      expect(
        mockRepository.findAllByWorkoutIdAndExerciseOrder
      ).toHaveBeenCalledWith(workoutId, exerciseOrder);
    });

    it("workoutGroup을 찾는도중 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB Error");
      mockRepository.findAllByWorkoutIdAndExerciseOrder.mockRejectedValue(
        mockError
      );
      await expect(
        service.getWorkoutGroupByWorkoutDetail(detail)
      ).rejects.toThrow(mockError);
    });
  });

  describe("getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder", () => {
    it("전달받은 인자에 맞는 workoutDetails를 반환한다", async () => {
      const details: Saved<LocalWorkoutDetail>[] = [
        { ...mockWorkoutDetail.past, workoutId, exerciseOrder },
      ];
      mockRepository.findAllByWorkoutIdAndExerciseOrder.mockResolvedValue(
        details
      );

      const result =
        await service.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
          workoutId,
          exerciseOrder
        );

      expect(result).toEqual(details);
      expect(
        mockRepository.findAllByWorkoutIdAndExerciseOrder
      ).toHaveBeenCalledWith(workoutId, exerciseOrder);
    });
  });

  describe("getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs", () => {
    const pairs = [
      { workoutId: 100, exerciseOrder: 1 },
      { workoutId: 200, exerciseOrder: 2 },
    ];

    it("전달받은 pairs에 맞는 workoutDetails를 반환한다", async () => {
      const details: Saved<LocalWorkoutDetail>[] = [
        { ...mockWorkoutDetail.past, workoutId: 100, exerciseOrder: 1 },
        { ...mockWorkoutDetail.past, workoutId: 200, exerciseOrder: 2 },
      ];
      mockRepository.findAllByWorkoutIdAndExerciseOrderPairs.mockResolvedValue(
        details
      );

      const result =
        await service.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
          pairs
        );

      expect(result).toEqual(details);
      expect(
        mockRepository.findAllByWorkoutIdAndExerciseOrderPairs
      ).toHaveBeenCalledWith(pairs);
    });

    it("repository에서 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockRepository.findAllByWorkoutIdAndExerciseOrderPairs.mockRejectedValue(
        mockError
      );

      await expect(
        service.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(pairs)
      ).rejects.toThrow(mockError);
    });
  });

  describe("getLatestWorkoutDetailByDetail", () => {
    const currentDetail: Saved<LocalWorkoutDetail> = {
      ...mockWorkoutDetail.past,
    };
    const currentWorkout = {
      ...mockWorkout.planned,
      id: workoutId,
      date: "2025-10-01",
    };
    it("과거 기록이 여러 개 있을때, 기준일자 이전의 가장 최신 기록을 반환해야 한다", async () => {
      const candidates: Saved<LocalWorkoutDetail>[] = [
        {
          ...currentDetail,
          id: 11,
          workoutId: 1,
          isDone: true,
        },
        {
          ...currentDetail,
          id: 12,
          workoutId: 2,
          isDone: true,
        },
        {
          ...currentDetail,
          id: 13,
          workoutId: 3,
          isDone: true,
        },
      ];

      mockRepository.findAllDoneByExerciseId.mockResolvedValue(candidates);
      mockWorkoutRepository.findOneById
        .mockResolvedValueOnce(currentWorkout)
        .mockResolvedValueOnce({
          ...currentWorkout,
          id: 1,
          date: "2025-09-30",
        })
        .mockResolvedValueOnce({
          ...currentWorkout,
          id: 2,
          date: "2025-10-29",
        })
        .mockResolvedValueOnce({
          ...currentWorkout,
          id: 3,
          date: "2025-09-28",
        });

      const result =
        await service.getLatestWorkoutDetailByDetail(currentDetail);

      expect(result).toBeDefined();
      expect(result?.id).toBe(11);
    });

    it("과거 기록이 없을경우 undefined를 반환한다", async () => {
      mockRepository.findAllDoneByExerciseId.mockResolvedValue([]);
      const result =
        await service.getLatestWorkoutDetailByDetail(currentDetail);
      expect(result).toBeUndefined();
    });
    it("repository 조회 중 에러가 발생하면, 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB Error");
      mockRepository.findAllDoneByExerciseId.mockRejectedValue(mockError);

      await expect(
        service.getLatestWorkoutDetailByDetail(currentDetail)
      ).rejects.toThrow(mockError);
    });
  });
});
