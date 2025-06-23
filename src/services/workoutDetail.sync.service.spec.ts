import { createServerWorkoutDetailMock } from "./../__mocks__/workoutDetail.mock";
import { createMockWorkoutDetailRepository } from "@/__mocks__/repositories/workoutDetail.repository.mock";
import { createMockWorkoutDetailAdapter } from "@/__mocks__/adapters/workoutDetail.adapter.mock";
import { createMockWorkoutDetailApi } from "@/__mocks__/api/workoutDetail.api.mock";
import { createMockExerciseService } from "@/__mocks__/services/exercise.service.mock";
import { createMockWorkoutService } from "@/__mocks__/services/workout.service.mock";
import { IWorkoutDetailSyncService } from "@/types/services";
import { WorkoutDetailSyncService } from "@/services/workoutDetail.sync.service";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import {
  ClientExercise,
  ClientWorkout,
  LocalExercise,
  LocalWorkout,
  LocalWorkoutDetailWithServerWorkoutId,
} from "@/types/models";
import { SyncWorkoutDetailsToServerResponse } from "@/api/workoutDetail.api";
import { update } from "lodash";

const mockRepository = createMockWorkoutDetailRepository();
const mockAdapter = createMockWorkoutDetailAdapter();
const mockApi = createMockWorkoutDetailApi();
const mockExerciseService = createMockExerciseService();
const mockWorkoutService = createMockWorkoutService();

describe("WorkoutDetailSyncService", () => {
  let service: IWorkoutDetailSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkoutDetailSyncService(
      mockRepository,
      mockAdapter,
      mockApi,
      mockExerciseService,
      mockWorkoutService
    );
  });

  describe("overwriteWithServerWorkoutDetails", () => {
    const userId = "user-123";
    const mockServerData = [mockWorkoutDetail.server];
    const mockDetail = {
      ...mockWorkoutDetail.past,
      isSynced: true,
      serverId: "server-123",
    };
    const mockEx: LocalExercise = mockExercise.synced;
    const mockWo: LocalWorkout = mockWorkout.synced;
    it("서버 데이터를 받아 매핑하여 로컬DB에 덮어씌운다", async () => {
      mockApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);

      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

      mockAdapter.createOverwriteWorkoutDetailPayload.mockReturnValue(
        mockDetail
      );

      await service.overwriteWithServerWorkoutDetails(userId);
      expect(mockApi.fetchWorkoutDetailsFromServer).toHaveBeenCalledWith(
        userId
      );
      expect(mockRepository.clear).toHaveBeenCalled();
      expect(mockRepository.bulkAdd).toHaveBeenCalledWith([mockDetail]);
      expect(mockExerciseService.getExerciseWithServerId).toHaveBeenCalledWith(
        mockServerData[0].exerciseId
      );
      expect(mockWorkoutService.getWorkoutWithServerId).toHaveBeenCalledWith(
        mockServerData[0].workoutId
      );
      expect(
        mockAdapter.createOverwriteWorkoutDetailPayload
      ).toHaveBeenCalledWith(mockServerData[0], mockEx, mockWo);
    });

    it("매핑에 필요한 exercise나 workout을 찾지 못하면 에러를 던지고, DB를 초기화하지 않는다", async () => {
      mockApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValueOnce({
        ...mockEx,
        id: undefined,
      });
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(
        mockWorkout.synced
      );

      const mockError = new Error("exerciseId 또는 workoutId가 없습니다");
      await expect(
        service.overwriteWithServerWorkoutDetails(userId)
      ).rejects.toThrow(mockError);

      expect(mockRepository.clear).not.toHaveBeenCalled();
      expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("덮어씌우는 도중 에러 발생시 해당 에러를 그대로 전파한다", async () => {
      mockApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

      const mockError = new Error("DB Error");
      mockRepository.bulkAdd.mockRejectedValue(mockError);
      await expect(
        service.overwriteWithServerWorkoutDetails(userId)
      ).rejects.toThrow(mockError);
    });
  });

  describe("syncToServerWorkoutDetails", () => {
    const unsyncedDetail = { ...mockWorkoutDetail.unsynced, id: 3 };
    it("동기화할 데이터가 없으면 빈배열로 API를 호출하고, db 업데이트는 하지않는다", async () => {
      const syncedDetails = [
        { ...mockWorkoutDetail.past, id: 1, isSynced: true },
        { ...mockWorkoutDetail.past, id: 2, isSynced: true },
      ];
      mockRepository.findAll.mockResolvedValue(syncedDetails);
      mockApi.postWorkoutDetailsToServer.mockResolvedValue({
        success: true,
        updated: [],
      });

      await service.syncToServerWorkoutDetails();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockApi.postWorkoutDetailsToServer).toHaveBeenCalledWith([]);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("unsynced 데이터를 서버에 동기화하고 로컬 DB를 업데이트한다", async () => {
      const allDetails = [
        { ...mockWorkoutDetail.past, id: 1, isSynced: true },
        { ...mockWorkoutDetail.past, id: 2, isSynced: true },
        unsyncedDetail,
      ];

      const mockEx: LocalExercise = {
        ...mockExercise.synced,
        id: unsyncedDetail.exerciseId,
        serverId: 111,
      };
      const mockWo: LocalWorkout = {
        ...mockWorkout.synced,
        id: unsyncedDetail.workoutId,
        serverId: "wo-server-1",
      };

      const mappedPayload: LocalWorkoutDetailWithServerWorkoutId = {
        ...unsyncedDetail,
        exerciseId: mockEx.serverId!,
        workoutId: mockWo.serverId!,
      };

      const apiResponse: SyncWorkoutDetailsToServerResponse = {
        success: true,
        updated: [
          {
            localId: unsyncedDetail.id,
            serverId: "server-detail-123",
            exerciseId: mockEx.serverId!,
            workoutId: mockWo.serverId!,
          },
        ],
      };

      mockRepository.findAll.mockResolvedValue(allDetails);
      mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(mockWo);
      mockAdapter.mapLocalWorkoutDetailToServer.mockReturnValue(mappedPayload);
      mockApi.postWorkoutDetailsToServer.mockResolvedValue(apiResponse);

      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

      await service.syncToServerWorkoutDetails();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);

      expect(mockExerciseService.getExerciseWithLocalId).toHaveBeenCalledWith(
        unsyncedDetail.exerciseId
      );
      expect(mockWorkoutService.getWorkoutWithLocalId).toHaveBeenCalledWith(
        unsyncedDetail.workoutId
      );
      expect(mockAdapter.mapLocalWorkoutDetailToServer).toHaveBeenCalledWith(
        unsyncedDetail,
        mockEx,
        mockWo
      );

      expect(mockApi.postWorkoutDetailsToServer).toHaveBeenCalledWith([
        mappedPayload,
      ]);

      expect(mockExerciseService.getExerciseWithServerId).toHaveBeenCalledWith(
        111
      );
      expect(mockWorkoutService.getWorkoutWithServerId).toHaveBeenCalledWith(
        "wo-server-1"
      );
      expect(mockRepository.update).toHaveBeenCalledWith(unsyncedDetail.id, {
        serverId: "server-detail-123",
        isSynced: true,
        exerciseId: mockEx.id,
        workoutId: mockWo.id,
      });
    });

    it("매핑 도중 exercise 또는 workout의 serverId가 없으면 에러를 던진다", async () => {
      const unsyncedDetail = { ...mockWorkoutDetail.unsynced, id: 3 };
      const allDetails = [unsyncedDetail];
      const mockEx = {
        ...mockExercise.synced,
        id: unsyncedDetail.exerciseId,
        serverId: null,
      };
      const mockWo = mockWorkout.synced;

      mockRepository.findAll.mockResolvedValue(allDetails);
      mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(mockWo);

      await expect(service.syncToServerWorkoutDetails()).rejects.toThrow(
        "exercise 또는 workout의 serverId가 없습니다."
      );
    });

    it("API 전송 도중 에러가 발생하면 해당 에러를 전파한다", async () => {
      const mockError = new Error("API 전송 실패");
      mockApi.postWorkoutDetailsToServer.mockRejectedValue(mockError);
      mockRepository.findAll.mockResolvedValue([unsyncedDetail]);
      mockExerciseService.getExerciseWithLocalId.mockResolvedValue(
        mockExercise.synced
      );
      mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(
        mockWorkout.synced
      );

      await expect(service.syncToServerWorkoutDetails()).rejects.toThrow(
        mockError
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
