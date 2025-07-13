import { mock } from "node:test";
import { mockWorkout } from "@/__mocks__/workout.mock";
import {
  createBaseWorkoutDetailMock,
  mockWorkoutDetail,
} from "@/__mocks__/workoutDetail.mock";
import { WorkoutDetailCoreService } from "@/services/workoutDetail.core.service";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { IWorkoutDetailCoreService, IWorkoutService } from "@/types/services";
import { 
  mockWorkoutDetailRepository, 
  mockWorkoutDetailAdapter, 
  mockWorkoutService 
} from "@/__mocks__/lib/di";

describe("WorkoutDetailCoreService", () => {
  let service: IWorkoutDetailCoreService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WorkoutDetailCoreService(
      mockWorkoutDetailRepository,
      mockWorkoutDetailAdapter,
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

      (mockWorkoutDetailRepository.findAllByWorkoutId as jest.Mock).mockResolvedValue(
        mockDetails
      );

      const result = await service.getLocalWorkoutDetails(userId, date);

      expect(mockWorkoutService.addLocalWorkout).not.toHaveBeenCalled();
      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(
        existingWorkout.id
      );
      expect(result).toEqual(mockDetails);
    });

    it("workout이 존재하지 않을경우, addLocalWorkout를 호출해 workout을 생성하고 빈 배열을 반환한다", async () => {
      mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(
        unExistingWorkout
      );

      const result = await service.getLocalWorkoutDetails(userId, date);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).not.toHaveBeenCalled();
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
      mockWorkoutDetailRepository.findAllByWorkoutIds.mockResolvedValue(details);

      const result = await service.getAllLocalWorkoutDetailsByWorkoutIds([
        workoutId,
      ]);

      expect(mockWorkoutDetailRepository.findAllByWorkoutIds).toHaveBeenCalledWith([
        workoutId,
      ]);
      expect(result).toEqual(details);
    });

    it("workoutIds에 일치하는 detail이 없는경우 빈 배열을 반환한다", async () => {
      mockWorkoutDetailRepository.findAllByWorkoutIds.mockResolvedValue([]);
      const result = await service.getAllLocalWorkoutDetailsByWorkoutIds([
        workoutId,
      ]);
      expect(result).toEqual([]);
    });

    it("findAllByWorkoutIds 에서 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockWorkoutDetailRepository.findAllByWorkoutIds.mockRejectedValue(mockError);
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
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);

      const result = await service.getLocalWorkoutDetailsByWorkoutId(workoutId);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(details);
    });

    it("일치하는 detail이 없는경우 빈 배열을 반환한다", async () => {
      const details = [];
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      const result = await service.getLocalWorkoutDetailsByWorkoutId(workoutId);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(details);
    });

    it("findAllByWorkoutId 에서 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockWorkoutDetailRepository.findAllByWorkoutId.mockRejectedValue(mockError);
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
      mockWorkoutDetailRepository.findAllByWorkoutIdOrderByExerciseOrder.mockResolvedValue(
        details
      );
      const result = await service.getStartExerciseOrder(workoutId);
      expect(
        mockWorkoutDetailRepository.findAllByWorkoutIdOrderByExerciseOrder
      ).toHaveBeenCalledWith(workoutId);
      expect(result).toBe(4);
    });

    it("workout에 운동 기록이 없으면 1을 반환한다", async () => {
      mockWorkoutDetailRepository.findAllByWorkoutIdOrderByExerciseOrder.mockResolvedValue(
        []
      );
      const result = await service.getStartExerciseOrder(workoutId);
      expect(result).toBe(1);
    });

    it("운동기록 조회중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockWorkoutDetailRepository.findAllByWorkoutIdOrderByExerciseOrder.mockRejectedValue(
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
      expect(mockWorkoutDetailRepository.add).toHaveBeenCalledWith(detaiInput);
    });

    it("workoutDetail 추가 도중 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockWorkoutDetailRepository.add.mockRejectedValue(mockError);
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

    mockWorkoutDetailAdapter.getNewWorkoutDetails.mockReturnValue([
      mockWorkoutDetail1,
      mockWorkoutDetail2,
    ]);
    it("전달받은 인자를 기반으로 새로운 운동을 생성한다", async () => {
      mockWorkoutDetailRepository.bulkAdd.mockResolvedValue(2);

      const result = await service.addLocalWorkoutDetailsByWorkoutId(
        workoutId,
        startOrder,
        selectedExercise
      );

      expect(mockWorkoutDetailAdapter.getNewWorkoutDetails).toHaveBeenCalledWith(
        selectedExercise,
        { workoutId, startOrder },
        "kg"
      );
      expect(result).toBe(2);
      expect(mockWorkoutDetailRepository.bulkAdd).toHaveBeenCalledWith([
        mockWorkoutDetail1,
        mockWorkoutDetail2,
      ]);
    });

    it("workoutDetails 추가 도중 에러가 발생할경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockWorkoutDetailRepository.bulkAdd.mockRejectedValue(mockError);
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
      mockWorkoutDetailRepository.bulkAdd.mockResolvedValue(mappedDetails.length);

      await service.addPastWorkoutDetailsToWorkout(mappedDetails);

      expect(mockWorkoutDetailRepository.bulkAdd).toHaveBeenCalledWith(mappedDetails);
    });

    it("빈 배열을 전달할 경우 repository를 호출하지 않고 즉시 반환한다", async () => {
      await service.addPastWorkoutDetailsToWorkout([]);

      expect(mockWorkoutDetailRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("bulkAdd 도중 에러가 발생할 경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("bulkAdd 실패");
      mockWorkoutDetailRepository.bulkAdd.mockRejectedValue(mockError);

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
      mockWorkoutDetailAdapter.getAddSetToWorkoutByLastSet.mockReturnValue(newSetInput);
      mockWorkoutDetailRepository.add.mockResolvedValue(555);

      const result = await service.addSetToWorkout(lastSet);

      expect(mockWorkoutDetailAdapter.getAddSetToWorkoutByLastSet).toHaveBeenCalledWith(
        lastSet,
        "kg"
      );
      expect(mockWorkoutDetailRepository.add).toHaveBeenCalledWith(newSetInput);
      expect(result).toEqual(newSet);
    });

    it("다음세트 생성중 에러가 발생할경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 추가 실패");
      mockWorkoutDetailAdapter.getAddSetToWorkoutByLastSet.mockReturnValue(newSetInput);
      mockWorkoutDetailRepository.add.mockRejectedValue(mockError);
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
      mockWorkoutDetailAdapter.getNewWorkoutDetails.mockReturnValue(newDetails);
      mockWorkoutDetailRepository.bulkAdd.mockResolvedValue(newDetails.length);

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
      expect(mockWorkoutDetailAdapter.getNewWorkoutDetails).toHaveBeenCalledWith(
        selectedExercises,
        { workoutId: mockedWorkout.id, startOrder },
        "kg"
      );
      expect(mockWorkoutDetailRepository.bulkAdd).toHaveBeenCalledWith(newDetails);

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
      expect(mockWorkoutDetailAdapter.getNewWorkoutDetails).not.toHaveBeenCalled();
      expect(mockWorkoutDetailRepository.bulkAdd).not.toHaveBeenCalled();
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
      expect(mockWorkoutDetailRepository.update).toHaveBeenCalledWith(
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
      expect(mockWorkoutDetailRepository.update).not.toHaveBeenCalled();
    });

    it("업데이트 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("업데이트 실패");
      mockWorkoutDetailRepository.update.mockRejectedValue(mockError);

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
      expect(mockWorkoutDetailRepository.bulkPut).toHaveBeenCalledWith(updatedDetails);
    });

    it("업데이트 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("bulkPut 실패");
      mockWorkoutDetailRepository.bulkPut.mockRejectedValueOnce(mockError);

      await expect(
        service.updateWorkoutDetails(updatedDetails)
      ).rejects.toThrow(mockError);
    });
  });

  describe("deleteWorkoutDetail", () => {
    const detailId = 123;

    it("전달받은 id로 repository.delete를 호출한다", async () => {
      await service.deleteWorkoutDetail(detailId);
      expect(mockWorkoutDetailRepository.delete).toHaveBeenCalledWith(detailId);
    });

    it("삭제 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("삭제 실패");
      mockWorkoutDetailRepository.delete.mockRejectedValue(mockError);

      await expect(service.deleteWorkoutDetail(detailId)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("deleteWorkoutDetails", () => {
    const details: Saved<LocalWorkoutDetail>[] = [
      { ...mockWorkoutDetail.past, id: 1 },
      { ...mockWorkoutDetail.past, id: 2 },
    ];
    it("전달된 details를 삭제한다", async () => {
      const ids = details.map((detail) => detail.id!);
      await service.deleteWorkoutDetails(details);
      expect(mockWorkoutDetailRepository.bulkDelete).toHaveBeenCalledWith(ids);
    });

    it("빈배열을 전달한 경우 즉시 리턴한다", async () => {
      await service.deleteWorkoutDetails([]);
      expect(mockWorkoutDetailRepository.bulkDelete).not.toHaveBeenCalled();
    });

    it("삭제 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("삭제 실패");
      mockWorkoutDetailRepository.bulkDelete.mockRejectedValueOnce(mockError);
      await expect(service.deleteWorkoutDetails(details)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("deleteDetailsByWorkoutId", () => {
    const workoutId = 123;
    const details: Saved<LocalWorkoutDetail>[] = [
      { ...mockWorkoutDetail.past, id: 1, workoutId },
      { ...mockWorkoutDetail.past, id: 2, workoutId },
    ];
    it("전달받은 workoutId에 일치하는 모든 detail과 workout을 삭제한다", async () => {
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);

      await service.deleteDetailsByWorkoutId(workoutId);
      expect(mockWorkoutDetailRepository.bulkDelete).toHaveBeenCalledWith([1, 2]);
      expect(mockWorkoutService.deleteLocalWorkout).toHaveBeenCalledWith(
        workoutId
      );
    });
    it("전달받은 workoutId에 해당하는 detail이 없는경우에도 workout을 삭제한다", async () => {
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue([]);

      await service.deleteDetailsByWorkoutId(workoutId);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(mockWorkoutDetailRepository.bulkDelete).toHaveBeenCalledWith([]);
      expect(mockWorkoutService.deleteLocalWorkout).toHaveBeenCalledWith(
        workoutId
      );
    });

    it("삭제 도중 에러가 발생하면 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("삭제 실패");

      mockWorkoutDetailRepository.bulkDelete.mockRejectedValueOnce(mockError);

      await expect(service.deleteDetailsByWorkoutId(workoutId)).rejects.toThrow(
        mockError
      );

      expect(mockWorkoutService.deleteLocalWorkout).not.toHaveBeenCalled();
    });
  });

  describe("reorderExerciseOrderAfterDelete", () => {
    const workoutId = 123;
    it("exerciseOrder가 삭제된 detail의 exerciseOrder보다 큰 detail의 exerciseOrder을 1씩 감소시켜야한다 ", async () => {
      const details = [
        { ...mockWorkoutDetail.past, id: 1, workoutId, exerciseOrder: 1 },
        { ...mockWorkoutDetail.past, id: 2, workoutId, exerciseOrder: 3 },
        { ...mockWorkoutDetail.past, id: 3, workoutId, exerciseOrder: 4 },
        { ...mockWorkoutDetail.past, id: 4, workoutId, exerciseOrder: 5 },
      ];
      const mappedDetails = [
        { ...mockWorkoutDetail.past, id: 2, workoutId, exerciseOrder: 2 },
        { ...mockWorkoutDetail.past, id: 3, workoutId, exerciseOrder: 3 },
        { ...mockWorkoutDetail.past, id: 4, workoutId, exerciseOrder: 4 },
      ];
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterExerciseDelete.mockReturnValue(
        mappedDetails
      );

      await service.reorderExerciseOrderAfterDelete(workoutId, 2);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(
        mockWorkoutDetailAdapter.getReorderedDetailsAfterExerciseDelete
      ).toHaveBeenCalledWith(details, 2);
      expect(mockWorkoutDetailRepository.bulkPut).toHaveBeenCalledWith(mappedDetails);
    });

    it("exerciseOrder가 삭제된 detail보다 큰 details가 없는경우 업데이트하지 않는다 ", async () => {
      const details = [
        { ...mockWorkoutDetail.past, id: 1, workoutId, exerciseOrder: 1 },
        { ...mockWorkoutDetail.past, id: 2, workoutId, exerciseOrder: 2 },
        { ...mockWorkoutDetail.past, id: 3, workoutId, exerciseOrder: 3 },
        { ...mockWorkoutDetail.past, id: 4, workoutId, exerciseOrder: 4 },
      ];
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterExerciseDelete.mockReturnValue([]);

      await service.reorderExerciseOrderAfterDelete(workoutId, 1);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(mockWorkoutDetailRepository.bulkPut).not.toHaveBeenCalled();
    });

    it("재정렬 도중 에러가 발생하면 해당 에러를 전파한다", async () => {
      const mockError = new Error("재정렬 실패");
      const details = [
        { ...mockWorkoutDetail.past, id: 2, workoutId, exerciseOrder: 3 },
      ];
      const mappedDetails = [
        { ...mockWorkoutDetail.past, id: 2, workoutId, exerciseOrder: 2 },
      ];

      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterExerciseDelete.mockReturnValue(
        mappedDetails
      );
      mockWorkoutDetailRepository.bulkPut.mockRejectedValueOnce(mockError);

      await expect(
        service.reorderExerciseOrderAfterDelete(workoutId, 2)
      ).rejects.toThrow(mockError);
    });
  });

  describe("reorderSetOrderAfterDelete", () => {
    const workoutId = 123;
    const exerciseId = 456;
    it("setOrder가 삭제된 detail의 setOrder보다 큰 detail의 setOrder을 1씩 감소시켜야한다", async () => {
      const details = [
        {
          ...mockWorkoutDetail.past,
          id: 1,
          workoutId,
          exerciseId,
          setOrder: 1,
        },
        {
          ...mockWorkoutDetail.past,
          id: 2,
          workoutId,
          exerciseId,
          setOrder: 3,
        },
        {
          ...mockWorkoutDetail.past,
          id: 3,
          workoutId,
          exerciseId,
          setOrder: 4,
        },
        {
          ...mockWorkoutDetail.past,
          id: 4,
          workoutId,
          exerciseId,
          setOrder: 5,
        },
      ];
      const mappedDetails = [
        {
          ...mockWorkoutDetail.past,
          id: 2,
          workoutId,
          exerciseId,
          setOrder: 2,
        },
        {
          ...mockWorkoutDetail.past,
          id: 3,
          workoutId,
          exerciseId,
          setOrder: 3,
        },
        {
          ...mockWorkoutDetail.past,
          id: 4,
          workoutId,
          exerciseId,
          setOrder: 4,
        },
      ];
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterSetDelete.mockReturnValue(
        mappedDetails
      );

      await service.reorderSetOrderAfterDelete(workoutId, exerciseId, 2);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(mockWorkoutDetailRepository.bulkPut).toHaveBeenCalledWith(mappedDetails);
    });

    it("setOrder가 삭제된 detail보다 큰 detail이 없는경우 업데이트하지 않는다", async () => {
      const details = [
        {
          ...mockWorkoutDetail.past,
          id: 1,
          workoutId,
          exerciseId,
          setOrder: 1,
        },
      ];
      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterSetDelete.mockReturnValue([]);

      await service.reorderSetOrderAfterDelete(workoutId, exerciseId, 1);

      expect(mockWorkoutDetailRepository.findAllByWorkoutId).toHaveBeenCalledWith(workoutId);
      expect(mockWorkoutDetailRepository.bulkPut).not.toHaveBeenCalled();
    });

    it("재정렬 도중 에러가 발생하면 해당 에러를 전파한다", async () => {
      const mockError = new Error("재정렬 실패");
      const details = [
        {
          ...mockWorkoutDetail.past,
          id: 2,
          workoutId,
          exerciseId,
          setOrder: 3,
        },
      ];
      const mappedDetails = [
        {
          ...mockWorkoutDetail.past,
          id: 2,
          workoutId,
          exerciseId,
          setOrder: 2,
        },
      ];

      mockWorkoutDetailRepository.findAllByWorkoutId.mockResolvedValue(details);
      mockWorkoutDetailAdapter.getReorderedDetailsAfterSetDelete.mockReturnValue(
        mappedDetails
      );
      mockWorkoutDetailRepository.bulkPut.mockRejectedValueOnce(mockError);

      await expect(
        service.reorderSetOrderAfterDelete(workoutId, exerciseId, 2)
      ).rejects.toThrow(mockError);
    });
  });
});
