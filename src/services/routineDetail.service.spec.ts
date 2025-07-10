import { createMockRoutineDetailRepository } from "@/__mocks__/repositories/routineDetail.repository.mock";
import { createMockRoutineDetailAdapter } from "@/__mocks__/adapters/routineDetail.adapter.mock";
import { createMockRoutineDetailApi } from "@/__mocks__/api/routineDetail.api.mock";
import { createMockExerciseService } from "@/__mocks__/services/exercise.service.mock";
import { createMockRoutineService } from "@/__mocks__/services/routine.service.mock";
import { RoutineDetailService } from "@/services/routineDetail.service";
import { IRoutineDetailService } from "@/types/services";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutine } from "@/__mocks__/routine.mock";
import {
  ClientRoutineDetail,
  LocalExercise,
  LocalRoutine,
  LocalRoutineDetail,
  LocalRoutineDetailWithServerRoutineId,
  Saved,
} from "@/types/models";

const mockRepository = createMockRoutineDetailRepository();
const mockAdapter = createMockRoutineDetailAdapter();
const mockApi = createMockRoutineDetailApi();
const mockExerciseService = createMockExerciseService();
const mockRoutineService = createMockRoutineService();

describe("RoutineDetailService", () => {
  let service: IRoutineDetailService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoutineDetailService(
      mockExerciseService,
      mockRoutineService,
      mockRepository,
      mockAdapter,
      mockApi
    );
  });

  describe("getLocalRoutineDetails", () => {
    it("전달된 routineId에 해당하는 routineDetails를 반환한다", async () => {
      const routineId = 5;
      const mockDetails = [mockRoutineDetail.past];
      mockRepository.findAllByRoutineId.mockResolvedValue(mockDetails);

      const result = await service.getLocalRoutineDetails(routineId);

      expect(mockRepository.findAllByRoutineId).toHaveBeenCalledWith(routineId);
      expect(result).toEqual(mockDetails);
    });
  });

  describe("addLocalRoutineDetail", () => {
    it("전달받은 routineDetail을 추가한다", async () => {
      const detailInput = mockRoutineDetail.unsynced;
      mockRepository.add.mockResolvedValueOnce(1);

      await service.addLocalRoutineDetail(detailInput);

      expect(mockRepository.add).toHaveBeenCalledWith(detailInput);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(detailInput.routineId);
    });

    it("routineDetail 추가 도중 에러가 발생할경우 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");
      mockRepository.add.mockRejectedValue(mockError);
      const detailInput = mockRoutineDetail.createInput();
      await expect(service.addLocalRoutineDetail(detailInput)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("getAllLocalRoutineDetailsByRoutineIds", () => {
    it("routineIds에 일치하는 detail들을 배열로 반환한다", async () => {
      const routineIds = [1, 2, 3];
      const mockDetails = [
        { ...mockRoutineDetail.past, routineId: 1 },
        { ...mockRoutineDetail.past, routineId: 3 },
      ];
      mockRepository.findAllByRoutineIds.mockResolvedValue(mockDetails);

      const result =
        await service.getAllLocalRoutineDetailsByRoutineIds(routineIds);

      expect(mockRepository.findAllByRoutineIds).toHaveBeenCalledWith(
        routineIds
      );
      expect(result).toEqual(mockDetails);
    });

    it("routineIds에 일치하는 detail이 없으면 빈 배열을 반환한다", async () => {
      const routineIds = [1, 2, 3];
      mockRepository.findAllByRoutineIds.mockResolvedValue([]);

      const result =
        await service.getAllLocalRoutineDetailsByRoutineIds(routineIds);

      expect(result).toEqual([]);
    });

    it("findAllByRoutineIds 에서 에러가 발생한경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB 조회 실패");
      mockRepository.findAllByRoutineIds.mockRejectedValue(mockError);
      await expect(
        service.getAllLocalRoutineDetailsByRoutineIds([1, 2, 3])
      ).rejects.toThrow(mockError);
    });
  });

  describe("addSetToRoutine", () => {
    it("전달받은 detail을 기반으로 다음세트를 생성한다", async () => {
      const mockRd = { ...mockRoutineDetail.unsynced };
      const newSetInput = {
        ...mockRd,
        setOrder: mockRd.setOrder + 1,
      };
      mockAdapter.getAddSetToRoutineByLastSet.mockReturnValue(newSetInput);
      mockRepository.add.mockResolvedValueOnce(5);
      const result = await service.addSetToRoutine(mockRd);

      expect(mockAdapter.getAddSetToRoutineByLastSet).toHaveBeenCalledWith(
        mockRd,
        "kg"
      );
      expect(mockRepository.add).toHaveBeenCalledWith(newSetInput);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(mockRd.routineId);

      expect(result).toEqual({ ...newSetInput, id: 5 });
    });

    it("다음 세트 생성도중 에러가 발생한 경우 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");
      mockAdapter.getAddSetToRoutineByLastSet.mockReturnValue(
        mockRoutineDetail.unsynced
      );
      mockRepository.add.mockRejectedValue(mockError);
      await expect(
        service.addSetToRoutine(mockRoutineDetail.unsynced)
      ).rejects.toThrow(mockError);
    });
  });

  describe("addLocalRoutineDetailsByWorkoutId", () => {
    const routineId = 10;
    const startOrder = 3;
    const selectedExercises = [
      { id: 1, name: "테스트운동1" },
      { id: 2, name: "테스트운동2" },
    ];
    it("선택한 운동과 인자로 새 routineDetails를 생성한다", async () => {
      const newDetails = [
        mockRoutineDetail.createInput({
          exerciseId: 1,
          exerciseName: "테스트운동1",
          routineId,
          exerciseOrder: 5,
        }),
        mockRoutineDetail.createInput({
          exerciseId: 2,
          exerciseName: "테스트운동2",
          routineId,
          exerciseOrder: 6,
        }),
      ];

      mockAdapter.getNewRoutineDetails.mockReturnValue(newDetails);
      mockRepository.bulkAdd.mockResolvedValue(newDetails.length);

      await service.addLocalRoutineDetailsByWorkoutId(
        routineId,
        startOrder,
        selectedExercises
      );

      expect(mockAdapter.getNewRoutineDetails).toHaveBeenCalledWith(
        selectedExercises,
        expect.objectContaining({ routineId, startOrder }),
        "kg"
      );
      expect(mockRepository.bulkAdd).toHaveBeenCalledWith(newDetails);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(routineId);
    });

    it("운동 생성 도중 에러 발생시 해당 에러를 전파한다", async () => {
      const mockExerciseError = new Error("운동 생성 실패");
      mockRepository.bulkAdd.mockRejectedValue(mockExerciseError);
      await expect(
        service.addLocalRoutineDetailsByWorkoutId(
          routineId,
          startOrder,
          selectedExercises
        )
      ).rejects.toThrow(mockExerciseError);
    });
  });

  describe("addPastWorkoutDetailsToRoutine", () => {
    const mappedDetails: LocalRoutineDetail[] = [
      mockRoutineDetail.createInput({
        id: 1,
        routineId: 100,
        exerciseId: 1,
        exerciseOrder: 1,
      }),
      mockRoutineDetail.createInput({
        id: 2,
        routineId: 100,
        exerciseId: 2,
        exerciseOrder: 2,
      }),
    ];

    it("전달받은 mappedDetails 배열로 bulkAdd를 호출한다", async () => {
      mockRepository.bulkAdd.mockResolvedValue(mappedDetails.length);

      await service.addPastWorkoutDetailsToRoutine(mappedDetails);

      expect(mockRepository.bulkAdd).toHaveBeenCalledWith(mappedDetails);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(mappedDetails[0].routineId);
    });

    it("빈 배열을 전달할 경우 repository를 호출하지 않고 즉시 반환한다", async () => {
      await service.addPastWorkoutDetailsToRoutine([]);

      expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("bulkAdd 도중 에러가 발생할 경우 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("bulkAdd 실패");
      mockRepository.bulkAdd.mockRejectedValue(mockError);

      await expect(
        service.addPastWorkoutDetailsToRoutine(mappedDetails)
      ).rejects.toThrow(mockError);
    });
  });

  describe("cloneRoutineDetailWithNewRoutineId", () => {
    it("전달받은 detail과 routineId를 기반으로 새 routineDetail을 생성한다", async () => {
      const mockOriginalDetail = mockRoutineDetail.past;
      const newRoutineId = 20;
      const newDetailInput: LocalRoutineDetail = mockRoutineDetail.createInput({
        routineId: newRoutineId,
        exerciseId: mockOriginalDetail.exerciseId,
        exerciseName: mockOriginalDetail.exerciseName,
      });

      mockAdapter.cloneToCreateInput.mockReturnValue(newDetailInput);
      mockRepository.add.mockResolvedValueOnce(1);

      await service.cloneRoutineDetailWithNewRoutineId(
        mockOriginalDetail,
        newRoutineId
      );

      expect(mockAdapter.cloneToCreateInput).toHaveBeenCalledWith(
        mockOriginalDetail,
        newRoutineId
      );
      expect(mockRepository.add).toHaveBeenCalledWith(newDetailInput);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(newRoutineId);
    });

    it("새 routineDetail 생성 도중 에러 발생시 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");
      const mockOriginalDetail = mockRoutineDetail.past;
      const newRoutineId = 20;

      mockAdapter.cloneToCreateInput.mockReturnValue(
        mockRoutineDetail.createInput({ routineId: newRoutineId })
      );
      mockRepository.add.mockRejectedValue(mockError);

      await expect(
        service.cloneRoutineDetailWithNewRoutineId(
          mockOriginalDetail,
          newRoutineId
        )
      ).rejects.toThrow(mockError);
    });
  });

  describe("updateLocalRoutineDetail", () => {
    const updateInput: Partial<LocalRoutineDetail> = {
      id: 5,
      routineId: 10,
      exerciseId: 1,
      exerciseName: "테스트 운동",
    };
    it("전달받은 인자로 routineDetail을 업데이트한다", async () => {
      mockRepository.update.mockResolvedValueOnce(5);

      await service.updateLocalRoutineDetail(updateInput);

      expect(mockRepository.update).toHaveBeenCalledWith(
        updateInput.id,
        updateInput
      );
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(updateInput.routineId);
    });
    it("id가 제공되지 않은경우 에러를 던진다", async () => {
      const updateInput: Partial<LocalRoutineDetail> = {
        exerciseId: 1,
        exerciseName: "Updated Exercise",
      };

      await expect(
        service.updateLocalRoutineDetail(updateInput)
      ).rejects.toThrow("id 또는 routineId가 없습니다");
    });

    it("업데이트 도중 에러가 발생한 경우 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");

      mockRepository.update.mockRejectedValueOnce(mockError);

      await expect(
        service.updateLocalRoutineDetail(updateInput)
      ).rejects.toThrow(mockError);
    });
  });
  describe("deleteRoutineDetail", () => {
    const detailId = 5;
    it("전달받은 detailId에 해당하는 routineDetail을 삭제한다", async () => {
      mockRepository.delete.mockResolvedValueOnce(undefined);

      await service.deleteRoutineDetail(detailId);

      expect(mockRepository.delete).toHaveBeenCalledWith(detailId);
    });

    it("삭제 도중 에러가 발생한 경우 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");
      mockRepository.delete.mockRejectedValueOnce(mockError);

      await expect(service.deleteRoutineDetail(detailId)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("deleteRoutineDetails", () => {
    it("전달받은 details를 삭제한다", async () => {
      const details: Saved<LocalRoutineDetail>[] = [
        { ...mockRoutineDetail.past, id: 1 },
        { ...mockRoutineDetail.past, id: 2 },
      ];
      mockRepository.bulkDelete.mockResolvedValueOnce(undefined);

      await service.deleteRoutineDetails(details);

      expect(mockRepository.bulkDelete).toHaveBeenCalledWith([1, 2]);
      expect(
        mockRoutineService.updateLocalRoutineUpdatedAt
      ).toHaveBeenCalledWith(details[0].routineId);
    });

    it("삭제 도중 에러 발생시 해당 에러를 전파한다", async () => {
      const mockError = new Error("DB Error");
      const details: Saved<LocalRoutineDetail>[] = [
        { ...mockRoutineDetail.past },
      ];
      mockRepository.bulkDelete.mockRejectedValueOnce(mockError);

      await expect(service.deleteRoutineDetails(details)).rejects.toThrow(
        mockError
      );
    });
  });

  describe("overwriteWithServerRoutineDetails", () => {
    const userId = "user-123";
    const mockEx = mockExercise.synced;
    const mockR = mockRoutine.synced;
    if (!mockEx.serverId || !mockR.serverId) {
      throw new Error("테스트용 exerciseId 또는 routineId가 없습니다");
    }
    const mockServerData: ClientRoutineDetail[] = [
      {
        ...mockRoutineDetail.server,
        exerciseId: mockEx.serverId,
        routineId: mockR.serverId,
      },
    ];
    it("서버로부터 routineDetails를 가져와 덮어씌운다", async () => {
      const mockToInsert = [
        {
          ...mockRoutineDetail.server,
          id: undefined,
          serverId: mockRoutineDetail.server.id,
          exerciseId: mockEx.id,
          routineId: mockR.id,
          isSynced: true,
        },
      ];

      mockApi.fetchRoutineDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockRoutineService.getRoutineByServerId.mockResolvedValue(mockR);
      mockRepository.bulkAdd.mockResolvedValueOnce(1);

      await service.overwriteWithServerRoutineDetails(userId);
      expect(mockApi.fetchRoutineDetailsFromServer).toHaveBeenCalledWith(
        userId
      );
      expect(mockRepository.clear).toHaveBeenCalled();
      expect(mockRepository.bulkAdd).toHaveBeenCalledWith(mockToInsert);
    });

    it("매핑에 필요한 exercise나 workout을 찾지 못하면 에러를 던지고, DB를 초기화하지 않는다", async () => {
      const mockError = new Error(
        "exerciseId 또는 routineId가 일치하는 데이터를 찾을 수 없습니다"
      );

      mockApi.fetchRoutineDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValueOnce(
        undefined
      );
      mockRoutineService.getRoutineByServerId.mockResolvedValue(mockR);

      await expect(
        service.overwriteWithServerRoutineDetails(userId)
      ).rejects.toThrow(mockError);
      expect(mockRepository.clear).not.toHaveBeenCalled();
      expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("덮어씌우는 도중 에러 발생시 해당 에러를 그대로 전파한다", async () => {
      const mockError = new Error("DB Error");

      mockApi.fetchRoutineDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockRoutineService.getRoutineByServerId.mockResolvedValue(mockR);
      mockRepository.bulkAdd.mockRejectedValueOnce(mockError);

      await expect(
        service.overwriteWithServerRoutineDetails(userId)
      ).rejects.toThrow(mockError);
    });
  });

  // describe("syncToServerRoutineDetails", () => {
  //   const unsyncedDetail = mockRoutineDetail.unsynced;
  //   const mockEx: LocalExercise = mockExercise.synced;
  //   const mockRo: LocalRoutine = mockRoutine.synced;

  //   it("동기화할 데이터가 없으면 빈배열로 API를 호출하고, db 업데이트는 하지않는다", async () => {
  //     const syncedDetails = [
  //       { ...mockRoutineDetail.past, id: 1, isSynced: true },
  //       { ...mockRoutineDetail.past, id: 2, isSynced: true },
  //     ];
  //     mockRepository.findAll.mockResolvedValue(syncedDetails);
  //     mockApi.postRoutineDetailsToServer.mockResolvedValue({
  //       success: true,
  //       updated: [],
  //     });

  //     await service.syncToServerRoutineDetails();

  //     expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  //     expect(mockApi.postRoutineDetailsToServer).toHaveBeenCalledWith([]);
  //     expect(mockRepository.update).not.toHaveBeenCalled();
  //   });

  //   it("unsynced 데이터를 서버에 동기화하고 로컬 DB를 업데이트한다", async () => {
  //     const allDetails = [
  //       { ...mockRoutineDetail.past, id: 1, isSynced: true },
  //       { ...mockRoutineDetail.past, id: 2, isSynced: true },
  //       unsyncedDetail,
  //     ];

  //     const mappedPayload: LocalRoutineDetailWithServerRoutineId = {
  //       ...unsyncedDetail,
  //       exerciseId: mockEx.serverId!,
  //       routineId: mockRo.serverId!,
  //     };

  //     const apiResponse: SyncRoutineDetailsToServerResponse = {
  //       success: true,
  //       updated: [
  //         {
  //           localId: unsyncedDetail.id!,
  //           serverId: "server-detail-123",
  //           exerciseId: mockEx.serverId!,
  //           routineId: mockRo.serverId!,
  //         },
  //       ],
  //     };

  //     mockRepository.findAll.mockResolvedValue(allDetails);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
  //     mockRoutineService.getRoutineByLocalId.mockResolvedValue(mockRo);
  //     mockAdapter.mapLocalRoutineDetailToServer.mockReturnValue(mappedPayload);
  //     mockApi.postRoutineDetailsToServer.mockResolvedValue(apiResponse);

  //     mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
  //     mockRoutineService.getRoutineByServerId.mockResolvedValue(mockRo);

  //     await service.syncToServerRoutineDetails();

  //     expect(mockRepository.findAll).toHaveBeenCalledTimes(1);

  //     expect(mockExerciseService.getExerciseWithLocalId).toHaveBeenCalledWith(
  //       unsyncedDetail.exerciseId
  //     );
  //     expect(mockRoutineService.getRoutineByLocalId).toHaveBeenCalledWith(
  //       unsyncedDetail.routineId
  //     );
  //     expect(mockAdapter.mapLocalRoutineDetailToServer).toHaveBeenCalledWith(
  //       unsyncedDetail,
  //       mockEx,
  //       mockRo
  //     );

  //     expect(mockApi.postRoutineDetailsToServer).toHaveBeenCalledWith([
  //       mappedPayload,
  //     ]);

  //     expect(mockExerciseService.getExerciseWithServerId).toHaveBeenCalledWith(
  //       mockEx.serverId
  //     );
  //     expect(mockRoutineService.getRoutineByServerId).toHaveBeenCalledWith(
  //       mockRo.serverId
  //     );
  //     expect(mockRepository.update).toHaveBeenCalledWith(unsyncedDetail.id, {
  //       serverId: "server-detail-123",
  //       isSynced: true,
  //       exerciseId: mockEx.id,
  //       routineId: mockRo.id,
  //     });
  //   });

  //   it("매핑 도중 exercise 또는 routine의 serverId가 없으면 에러를 던진다", async () => {
  //     const allDetails = [unsyncedDetail];
  //     const mockExNoServerId = {
  //       ...mockEx,
  //       serverId: null,
  //     };

  //     mockRepository.findAll.mockResolvedValue(allDetails);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(
  //       mockExNoServerId
  //     );
  //     mockRoutineService.getRoutineByLocalId.mockResolvedValue(mockRo);

  //     await expect(service.syncToServerRoutineDetails()).rejects.toThrow("");
  //   });

  //   it("API 전송 도중 에러가 발생하면 해당 에러를 전파한다", async () => {
  //     const mockError = new Error("");
  //     mockApi.postRoutineDetailsToServer.mockRejectedValue(mockError);
  //     mockRepository.findAll.mockResolvedValue([unsyncedDetail]);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
  //     mockRoutineService.getRoutineByLocalId.mockResolvedValue(mockRo);

  //     await expect(service.syncToServerRoutineDetails()).rejects.toThrow(
  //       mockError
  //     );
  //     expect(mockRepository.update).not.toHaveBeenCalled();
  //   });
  // });
});
