import { mock } from "node:test";
import { mockWorkout } from "@/__mocks__/workout.mock";
import {
  createBaseWorkoutDetailMock,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";
import { WorkoutDetailCoreService } from "@/services/workoutDetail.core.service";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { IWorkoutDetailCoreService, IWorkoutService } from "@/types/services";
import { createMockWorkoutService } from "@/__mocks__/services/workout.service.mock";
import { createMockWorkoutDetailAdapter } from "@/__mocks__/adapters/workoutDetail.adapter.mock";
import { createMockWorkoutDetailRepository } from "@/__mocks__/repositories/workoutDetail.repository.mock";

const mockRepository = createMockWorkoutDetailRepository();
const mockAdapter = createMockWorkoutDetailAdapter();
const mockWorkoutService = createMockWorkoutService();

describe("WorkoutDetailCoreService", () => {
  let service: IWorkoutDetailCoreService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WorkoutDetailCoreService(
      mockRepository,
      mockAdapter,
      mockWorkoutService
    );
  });
  const userId = "user-123";
  const date = "2025-06-01";
  const workoutId = 5;

  describe("getLocalWorkoutDetails", () => {
    const unExistingWorkout = undefined;

    it("workout이 이미 존재할경우, 새로운 workout을 생성하지 않고 해당 workout 에 맞는 workoutDetail을 반환한다", async () => {
      const existingWorkout = { ...mockWorkout.planned, userId, date };
      const mockDetails = [
        {
          ...mockWorkoutDetail.past,
          workoutId: existingWorkout.id,
        },
      ];

      mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(
        existingWorkout
      );

      (mockRepository.findAllByWorkoutId as jest.Mock).mockResolvedValue(
        mockDetails
      );

      const result = await service.getLocalWorkoutDetails(userId, date);

      expect(mockWorkoutService.addLocalWorkout).not.toHaveBeenCalled();
      expect(mockRepository.findAllByWorkoutId).toHaveBeenCalledWith(
        existingWorkout.id
      );
      expect(result).toEqual(mockDetails);
    });

    it("workout이 존재하지 않을경우, addLocalWorkout를 호출해 workout을 생성하고 빈 배열을 반환한다", async () => {
      mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(
        unExistingWorkout
      );

      const result = await service.getLocalWorkoutDetails(userId, date);

      expect(mockRepository.findAllByWorkoutId).not.toHaveBeenCalled();
      expect(mockWorkoutService.addLocalWorkout).toHaveBeenCalledWith(
        userId,
        date
      );
      expect(result).toEqual([]);
    });

    it("workout이 존재하지 않아 새로 생성하는 과정에러 에러가 발생하면, 해당 에러르 그대로 전파한다", async () => {
      const mockError = new Error("생성 실패");
      mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(
        unExistingWorkout
      );
      mockWorkoutService.addLocalWorkout.mockRejectedValue(mockError);
      await expect(
        service.getLocalWorkoutDetails(userId, date)
      ).rejects.toThrow(mockError);
    });
  });

  describe("getAllLocalWorkoutDetailsByWorkoutIds", () => {
    it("workoutIds에 일치하는 detail들을 배열로 반환한다", async () => {
      const details: Saved<LocalWorkoutDetail>[] = [
        { ...mockWorkoutDetail.past, workoutId },
      ];
      mockRepository.findAllByWorkoutIds.mockResolvedValue(details);

      const result = await service.getAllLocalWorkoutDetailsByWorkoutIds([
        workoutId,
      ]);

      expect(mockRepository.findAllByWorkoutIds).toHaveBeenCalledWith([
        workoutId,
      ]);
      expect(result).toEqual(details);
    });

    it("workoutIds에 일치하는 detail이 없는경우 빈 배열을 반환한다", async () => {
      mockRepository.findAllByWorkoutIds.mockResolvedValue([]);
      const result = await service.getAllLocalWorkoutDetailsByWorkoutIds([
        workoutId,
      ]);
      expect(result).toEqual([]);
    });

    it("findAllByWorkoutIds 에서 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockRepository.findAllByWorkoutIds.mockRejectedValue(mockError);
      await expect(
        service.getAllLocalWorkoutDetailsByWorkoutIds([workoutId])
      ).rejects.toThrow(mockError);
    });
  });

  describe("getLocalWorkoutDetailsByWorkoutId", () => {
    it("workoutId에 일치하는 detail들을 배열로 반환한다", async () => {
      const details: Saved<LocalWorkoutDetail>[] = [
        { ...mockWorkoutDetail.past, workoutId },
      ];
      mockRepository.findAllByWorkoutId.mockResolvedValue(details);

      const result = await service.getLocalWorkoutDetailsByWorkoutId(workoutId);

      expect(mockRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(details);
    });

    it("일치하는 detail이 없는경우 빈 배열을 반환한다", async () => {
      const details = [];
      mockRepository.findAllByWorkoutId.mockResolvedValue(details);
      const result = await service.getLocalWorkoutDetailsByWorkoutId(workoutId);

      expect(mockRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(details);
    });

    it("findAllByWorkoutId 에서 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockRepository.findAllByWorkoutId.mockRejectedValue(mockError);
      await expect(
        service.getLocalWorkoutDetailsByWorkoutId(workoutId)
      ).rejects.toThrow(mockError);
    });
  });

  describe("getStartExerciseOrder", () => {
    it("workout에 운동 기록이 이미 있으면 마지막 기록의 exerciseOrder + 1 을 반환한다", async () => {
      const details = [
        { ...mockWorkoutDetail.past, exerciseOrder: 2 },
        { ...mockWorkoutDetail.past, exerciseOrder: 3 },
      ];
      mockRepository.findAllByWorkoutIdOrderByExerciseOrder.mockResolvedValue(
        details
      );
      const result = await service.getStartExerciseOrder(workoutId);
      expect(
        mockRepository.findAllByWorkoutIdOrderByExerciseOrder
      ).toHaveBeenCalledWith(workoutId);
      expect(result).toBe(4);
    });

    it("workout에 운동 기록이 없으면 1을 반환한다", async () => {
      mockRepository.findAllByWorkoutIdOrderByExerciseOrder.mockResolvedValue(
        []
      );
      const result = await service.getStartExerciseOrder(workoutId);
      expect(result).toBe(1);
    });

    it("운동기록 조회중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockRepository.findAllByWorkoutIdOrderByExerciseOrder.mockRejectedValue(
        mockError
      );
      await expect(service.getStartExerciseOrder(workoutId)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("addLocalWorkoutDetail", () => {
    const detaiInput: LocalWorkoutDetail = createBaseWorkoutDetailMock();
    it("전달된 detaiInput로 올바르게 add 메서드를 호출한다", async () => {
      await service.addLocalWorkoutDetail(detaiInput);
      expect(mockRepository.add).toHaveBeenCalledWith(detaiInput);
    });

    it("workoutDetail 추가 도중 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockRepository.add.mockRejectedValue(mockError);
      await expect(service.addLocalWorkoutDetail(detaiInput)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("addLocalWorkoutDetailsByWorkoutId", () => {
    const startOrder = 5;
    const selectedExercise = [
      { id: 900, name: "테스트운동1" },
      { id: 901, name: "테스트운동2" },
    ];

    const mockWorkoutDetail1 = createBaseWorkoutDetailMock({
      id: 1,
      exerciseId: 900,
      workoutId,
      exerciseName: "테스트운동1",
    });
    const mockWorkoutDetail2 = createBaseWorkoutDetailMock({
      id: 2,
      exerciseId: 901,
      workoutId,
      exerciseName: "테스트운동2",
    });

    mockAdapter.getNewWorkoutDetails.mockReturnValue([
      mockWorkoutDetail1,
      mockWorkoutDetail2,
    ]);
    it("전달받은 인자를 기반으로 새로운 운동을 생성한다", async () => {
      mockRepository.bulkAdd.mockResolvedValue(2);

      const result = await service.addLocalWorkoutDetailsByWorkoutId(
        workoutId,
        startOrder,
        selectedExercise
      );

      expect(mockAdapter.getNewWorkoutDetails).toHaveBeenCalledWith(
        selectedExercise,
        { workoutId, startOrder },
        "kg"
      );
      expect(result).toBe(2);
      expect(mockRepository.bulkAdd).toHaveBeenCalledWith([
        mockWorkoutDetail1,
        mockWorkoutDetail2,
      ]);
    });

    it("workoutDetails 추가 도중 에러가 발생할경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockRepository.bulkAdd.mockRejectedValue(mockError);
      await expect(
        service.addLocalWorkoutDetailsByWorkoutId(
          workoutId,
          startOrder,
          selectedExercise
        )
      ).rejects.toThrow(mockError);
    });
  });

  describe("addPastWorkoutDetailsToWorkout", () => {
    const mappedDetails: LocalWorkoutDetail[] = [
      createBaseWorkoutDetailMock({
        id: 1,
        workoutId: 100,
        exerciseId: 1,
        exerciseOrder: 1,
      }),
      createBaseWorkoutDetailMock({
        id: 2,
        workoutId: 100,
        exerciseId: 2,
        exerciseOrder: 2,
      }),
    ];

    it("전달받은 mappedDetails 배열로 bulkAdd를 호출한다", async () => {
      mockRepository.bulkAdd.mockResolvedValue(mappedDetails.length);

      await service.addPastWorkoutDetailsToWorkout(mappedDetails);

      expect(mockRepository.bulkAdd).toHaveBeenCalledWith(mappedDetails);
    });

    it("빈 배열을 전달할 경우 repository를 호출하지 않고 즉시 반환한다", async () => {
      await service.addPastWorkoutDetailsToWorkout([]);

      expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("bulkAdd 도중 에러가 발생할 경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("bulkAdd 실패");
      mockRepository.bulkAdd.mockRejectedValue(mockError);

      await expect(
        service.addPastWorkoutDetailsToWorkout(mappedDetails)
      ).rejects.toThrow(mockError);
    });
  });

  describe("addSetToWorkout", () => {
    const lastSet = {
      ...mockWorkoutDetail.past,
      exerciseOrder: 5,
      setOrder: 5,
    };
    const newSetInput = {
      ...lastSet,
      id: undefined,
      setOrder: 6,
    };
    const newSet = {
      ...newSetInput,
      id: 555,
    };

    it("전달받은 마지막세트를 기반으로 다음세트를 생성하며 해당 세트를 반환한다", async () => {
      mockAdapter.getAddSetToWorkoutByLastSet.mockReturnValue(newSetInput);
      mockRepository.add.mockResolvedValue(555);

      const result = await service.addSetToWorkout(lastSet);

      expect(mockAdapter.getAddSetToWorkoutByLastSet).toHaveBeenCalledWith(
        lastSet,
        "kg"
      );
      expect(mockRepository.add).toHaveBeenCalledWith(newSetInput);
      expect(result).toEqual(newSet);
    });

    it("다음세트 생성중 에러가 발생할경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockAdapter.getAddSetToWorkoutByLastSet.mockReturnValue(newSetInput);
      mockRepository.add.mockRejectedValue(mockError);
      await expect(service.addSetToWorkout(lastSet)).rejects.toThrow(mockError);
    });
  });

  describe("addLocalWorkoutDetailsByUserDate", () => {
    const mockedWorkout = { ...mockWorkout.planned, workoutId };
    const selectedExercises = [{ id: 900, name: "테스트운동1" }];
    const startOrder = 5;
    const newDetails = [
      createBaseWorkoutDetailMock({
        exerciseId: 900,
        workoutId: mockedWorkout.id,
      }),
    ];
    it("선택된 운동을 알맞은 workout에 추가한다", async () => {
      mockWorkoutService.addLocalWorkout.mockResolvedValue(mockedWorkout);
      const getExerciseOrderMock = jest
        .spyOn(service, "getStartExerciseOrder")
        .mockResolvedValue(startOrder);
      mockAdapter.getNewWorkoutDetails.mockReturnValue(newDetails);
      mockRepository.bulkAdd.mockResolvedValue(newDetails.length);

      const result = await service.addLocalWorkoutDetailsByUserDate(
        userId,
        date,
        selectedExercises
      );

      expect(mockWorkoutService.addLocalWorkout).toHaveBeenCalledWith(
        userId,
        date
      );
      expect(getExerciseOrderMock).toHaveBeenCalledWith(mockedWorkout.id);
      expect(mockAdapter.getNewWorkoutDetails).toHaveBeenCalledWith(
        selectedExercises,
        { workoutId: mockedWorkout.id, startOrder },
        "kg"
      );
      expect(mockRepository.bulkAdd).toHaveBeenCalledWith(newDetails);

      expect(result).toBe(newDetails.length);
    });

    it("selectedExercises으로 빈배열을 전달할경우 즉시 0을 반환한다", async () => {
      const result = await service.addLocalWorkoutDetailsByUserDate(
        userId,
        date,
        []
      );
      expect(result).toBe(0);
      expect(mockWorkoutService.addLocalWorkout).not.toHaveBeenCalled();
      expect(mockAdapter.getNewWorkoutDetails).not.toHaveBeenCalled();
      expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("운동을 추가하는 도중 에러가 발생할경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("운동 추가 실패");
      mockWorkoutService.addLocalWorkout.mockRejectedValue(mockError);

      await expect(
        service.addLocalWorkoutDetailsByUserDate(
          userId,
          date,
          selectedExercises
        )
      ).rejects.toThrow(mockError);
    });
  });

  describe("updateLocalWorkoutDetail", () => {
    const updateWorkoutInput: Partial<LocalWorkoutDetail> = {
      id: 1,
      exerciseName: "업데이트된 운동",
    };
    it("전달받은 인자로 detail을 업데이트한다", async () => {
      await service.updateLocalWorkoutDetail(updateWorkoutInput);
      expect(mockRepository.update).toHaveBeenCalledWith(
        updateWorkoutInput.id,
        updateWorkoutInput
      );
    });

    it("전달받은 인자에 id가 없는경우 에러를 던진다", async () => {
      const updateWorkoutInput: Partial<LocalWorkoutDetail> = {
        exerciseName: "업데이트된 운동",
      };
      await expect(
        service.updateLocalWorkoutDetail(updateWorkoutInput)
      ).rejects.toThrow("id가 없습니다");
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("업데이트 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("업데이트 실패");
      mockRepository.update.mockRejectedValue(mockError);

      await expect(
        service.updateLocalWorkoutDetail(updateWorkoutInput)
      ).rejects.toThrow(mockError);
    });
  });

  describe("updateWorkoutDetails", () => {
    const updatedDetails: LocalWorkoutDetail[] = [
      createBaseWorkoutDetailMock({ id: 1, exerciseName: "운동1" }),
      createBaseWorkoutDetailMock({ id: 2, exerciseName: "운동2" }),
    ];

    it("전달받은 details 배열로 bulkPut을 호출한다", async () => {
      await service.updateWorkoutDetails(updatedDetails);
      expect(mockRepository.bulkPut).toHaveBeenCalledWith(updatedDetails);
    });

    it("업데이트 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("bulkPut 실패");
      mockRepository.bulkPut.mockRejectedValue(mockError);

      await expect(
        service.updateWorkoutDetails(updatedDetails)
      ).rejects.toThrow(mockError);
    });
  });

  describe("deleteWorkoutDetail", () => {
    const detailId = 123;

    it("전달받은 id로 repository.delete를 호출한다", async () => {
      await service.deleteWorkoutDetail(detailId);
      expect(mockRepository.delete).toHaveBeenCalledWith(detailId);
    });

    it("삭제 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("삭제 실패");
      mockRepository.delete.mockRejectedValue(mockError);

      await expect(service.deleteWorkoutDetail(detailId)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("deleteWorkoutDetails", () => {
    const details: LocalWorkoutDetail[] = [
      createBaseWorkoutDetailMock({ id: 1 }),
      createBaseWorkoutDetailMock({ id: 2 }),
    ];
    it("전달된 details를 삭제한다", async () => {
      const ids = details.map((detail) => detail.id!);
      await service.deleteWorkoutDetails(details);
      expect(mockRepository.bulkDelete).toHaveBeenCalledWith(ids);
    });

    it("전달된 details에 id가 없는경우 에러를 던진다", async () => {
      const details: LocalWorkoutDetail[] = [
        createBaseWorkoutDetailMock({ id: 1 }),
        createBaseWorkoutDetailMock({ id: undefined }),
      ];
      await expect(service.deleteWorkoutDetails(details)).rejects.toThrow(
        "id가 없습니다"
      );
      expect(mockRepository.bulkDelete).not.toHaveBeenCalled();
    });

    it("빈배열을 전달한 경우 즉시 리턴한다", async () => {
      await service.deleteWorkoutDetails([]);
      expect(mockRepository.bulkDelete).not.toHaveBeenCalled();
    });

    it("삭제 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("삭제 실패");
      mockRepository.bulkDelete.mockRejectedValue(mockError);
      await expect(service.deleteWorkoutDetails(details)).rejects.toThrow(
        mockError
      );
    });
  });
});
