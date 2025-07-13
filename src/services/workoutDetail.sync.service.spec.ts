import { createServerWorkoutDetailMock } from "./../__mocks__/workoutDetail.mock";
import { 
  mockWorkoutDetailRepository,
  mockWorkoutDetailAdapter,
  mockWorkoutDetailApi,
  mockExerciseService,
  mockWorkoutService
} from "@/__mocks__/lib/di";
import { IWorkoutDetailSyncService } from "@/types/services";
import { WorkoutDetailSyncService } from "@/services/workoutDetail.sync.service";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { LocalExercise, LocalWorkout, Saved } from "@/types/models";

describe("WorkoutDetailSyncService", () => {
  let service: IWorkoutDetailSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkoutDetailSyncService(
      mockWorkoutDetailRepository,
      mockWorkoutDetailAdapter,
      mockWorkoutDetailApi,
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
    const mockEx: Saved<LocalExercise> = mockExercise.synced;
    const mockWo: Saved<LocalWorkout> = mockWorkout.synced;
    it("서버 데이터를 받아 매핑하여 로컬DB에 덮어씌운다", async () => {
      mockWorkoutDetailApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);

      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

      mockWorkoutDetailAdapter.createOverwriteWorkoutDetailPayload.mockReturnValue(
        mockDetail
      );

      await service.overwriteWithServerWorkoutDetails(userId);
      expect(mockWorkoutDetailApi.fetchWorkoutDetailsFromServer).toHaveBeenCalledWith(
        userId
      );
      expect(mockWorkoutDetailRepository.clear).toHaveBeenCalled();
      expect(mockWorkoutDetailRepository.bulkAdd).toHaveBeenCalledWith([mockDetail]);
      expect(mockExerciseService.getExerciseWithServerId).toHaveBeenCalledWith(
        mockServerData[0].exerciseId
      );
      expect(mockWorkoutService.getWorkoutWithServerId).toHaveBeenCalledWith(
        mockServerData[0].workoutId
      );
      expect(
        mockWorkoutDetailAdapter.createOverwriteWorkoutDetailPayload
      ).toHaveBeenCalledWith(mockServerData[0], mockEx, mockWo);
    });

    it("매핑에 필요한 exercise나 workout을 찾지 못하면 에러를 던지고, DB를 초기화하지 않는다", async () => {
      mockWorkoutDetailApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValueOnce(
        undefined
      );
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(
        mockWorkout.synced
      );

      const mockError = new Error("exerciseId 또는 workoutId가 없습니다");
      await expect(
        service.overwriteWithServerWorkoutDetails(userId)
      ).rejects.toThrow(mockError);

      expect(mockWorkoutDetailRepository.clear).not.toHaveBeenCalled();
      expect(mockWorkoutDetailRepository.bulkAdd).not.toHaveBeenCalled();
    });

    it("덮어씌우는 도중 에러 발생시 해당 에러를 그대로 전파한다", async () => {
      mockWorkoutDetailApi.fetchWorkoutDetailsFromServer.mockResolvedValue(mockServerData);
      mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
      mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

      const mockError = new Error("DB Error");
      mockWorkoutDetailRepository.bulkAdd.mockRejectedValue(mockError);
      await expect(
        service.overwriteWithServerWorkoutDetails(userId)
      ).rejects.toThrow(mockError);
    });
  });

  // describe("syncToServerWorkoutDetails", () => {
  //   const unsyncedDetail = { ...mockWorkoutDetail.unsynced, id: 3 };
  //   it("동기화할 데이터가 없으면 빈배열로 API를 호출하고, db 업데이트는 하지않는다", async () => {
  //     const syncedDetails = [
  //       { ...mockWorkoutDetail.past, id: 1, isSynced: true },
  //       { ...mockWorkoutDetail.past, id: 2, isSynced: true },
  //     ];
  //     mockWorkoutDetailRepository.findAll.mockResolvedValue(syncedDetails);
  //     mockWorkoutDetailApi.postWorkoutDetailsToServer.mockResolvedValue({
  //       success: true,
  //       updated: [],
  //     });

  //     await service.syncToServerWorkoutDetails();

  //     expect(mockWorkoutDetailRepository.findAll).toHaveBeenCalledTimes(1);
  //     expect(mockWorkoutDetailApi.postWorkoutDetailsToServer).toHaveBeenCalledWith([]);
  //     expect(mockWorkoutDetailRepository.update).not.toHaveBeenCalled();
  //   });

  //   it("unsynced 데이터를 서버에 동기화하고 로컬 DB를 업데이트한다", async () => {
  //     const allDetails = [
  //       { ...mockWorkoutDetail.past, id: 1, isSynced: true },
  //       { ...mockWorkoutDetail.past, id: 2, isSynced: true },
  //       unsyncedDetail,
  //     ];

  //     const mockEx: LocalExercise = {
  //       ...mockExercise.synced,
  //       id: unsyncedDetail.exerciseId,
  //       serverId: 111,
  //     };
  //     const mockWo: LocalWorkout = {
  //       ...mockWorkout.synced,
  //       id: unsyncedDetail.workoutId,
  //       serverId: "wo-server-1",
  //     };

  //     const mappedPayload: LocalWorkoutDetailWithServerWorkoutId = {
  //       ...unsyncedDetail,
  //       exerciseId: mockEx.serverId!,
  //       workoutId: mockWo.serverId!,
  //     };

  //     const apiResponse: SyncWorkoutDetailsToServerResponse = {
  //       success: true,
  //       updated: [
  //         {
  //           localId: unsyncedDetail.id,
  //           serverId: "server-detail-123",
  //           exerciseId: mockEx.serverId!,
  //           workoutId: mockWo.serverId!,
  //         },
  //       ],
  //     };

  //     mockWorkoutDetailRepository.findAll.mockResolvedValue(allDetails);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
  //     mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(mockWo);
  //     mockWorkoutDetailAdapter.mapLocalWorkoutDetailToServer.mockReturnValue(mappedPayload);
  //     mockWorkoutDetailApi.postWorkoutDetailsToServer.mockResolvedValue(apiResponse);

  //     mockExerciseService.getExerciseWithServerId.mockResolvedValue(mockEx);
  //     mockWorkoutService.getWorkoutWithServerId.mockResolvedValue(mockWo);

  //     await service.syncToServerWorkoutDetails();

  //     expect(mockWorkoutDetailRepository.findAll).toHaveBeenCalledTimes(1);

  //     expect(mockExerciseService.getExerciseWithLocalId).toHaveBeenCalledWith(
  //       unsyncedDetail.exerciseId
  //     );
  //     expect(mockWorkoutService.getWorkoutWithLocalId).toHaveBeenCalledWith(
  //       unsyncedDetail.workoutId
  //     );
  //     expect(mockWorkoutDetailAdapter.mapLocalWorkoutDetailToServer).toHaveBeenCalledWith(
  //       unsyncedDetail,
  //       mockEx,
  //       mockWo
  //     );

  //     expect(mockWorkoutDetailApi.postWorkoutDetailsToServer).toHaveBeenCalledWith([
  //       mappedPayload,
  //     ]);

  //     expect(mockExerciseService.getExerciseWithServerId).toHaveBeenCalledWith(
  //       111
  //     );
  //     expect(mockWorkoutService.getWorkoutWithServerId).toHaveBeenCalledWith(
  //       "wo-server-1"
  //     );
  //     expect(mockWorkoutDetailRepository.update).toHaveBeenCalledWith(unsyncedDetail.id, {
  //       serverId: "server-detail-123",
  //       isSynced: true,
  //       exerciseId: mockEx.id,
  //       workoutId: mockWo.id,
  //     });
  //   });

  //   it("매핑 도중 exercise 또는 workout의 serverId가 없으면 에러를 던진다", async () => {
  //     const unsyncedDetail = { ...mockWorkoutDetail.unsynced, id: 3 };
  //     const allDetails = [unsyncedDetail];
  //     const mockEx = {
  //       ...mockExercise.synced,
  //       id: unsyncedDetail.exerciseId,
  //       serverId: null,
  //     };
  //     const mockWo = mockWorkout.synced;

  //     mockWorkoutDetailRepository.findAll.mockResolvedValue(allDetails);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(mockEx);
  //     mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(mockWo);

  //     await expect(service.syncToServerWorkoutDetails()).rejects.toThrow(
  //       "exercise 또는 workout의 serverId가 없습니다."
  //     );
  //   });

  //   it("API 전송 도중 에러가 발생하면 해당 에러를 전파한다", async () => {
  //     const mockError = new Error("API 전송 실패");
  //     mockWorkoutDetailApi.postWorkoutDetailsToServer.mockRejectedValue(mockError);
  //     mockWorkoutDetailRepository.findAll.mockResolvedValue([unsyncedDetail]);
  //     mockExerciseService.getExerciseWithLocalId.mockResolvedValue(
  //       mockExercise.synced
  //     );
  //     mockWorkoutService.getWorkoutWithLocalId.mockResolvedValue(
  //       mockWorkout.synced
  //     );

  //     await expect(service.syncToServerWorkoutDetails()).rejects.toThrow(
  //       mockError
  //     );
  //     expect(mockWorkoutDetailRepository.update).not.toHaveBeenCalled();
  //   });
  // });
});
