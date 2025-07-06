import {
  mockExerciseService,
  mockRoutineDetailService,
  mockRoutineService,
  mockSyncAllAdapter,
  mockSyncAllApi,
  mockWorkoutDetailService,
  mockWorkoutService,
} from "@/__mocks__/lib/di";
import { mockExercise } from "@/__mocks__/exercise.mock";
import { mockRoutine } from "@/__mocks__/routine.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import { SyncAllService } from "@/services/syncAll.service";
import { ISyncAllService } from "@/types/services";
import { NestedExercise, NestedRoutine, NestedWorkout } from "@/types/models";

describe("SyncAllService", () => {
  let service: ISyncAllService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SyncAllService(
      mockExerciseService,
      mockWorkoutService,
      mockRoutineService,
      mockWorkoutDetailService,
      mockRoutineDetailService,
      mockSyncAllApi,
      mockSyncAllAdapter
    );
  });

  describe("overWriteToServer", () => {
    const mockUserId = "user-123";
    const mockExercises = [mockExercise.synced];
    const mockWorkouts = [mockWorkout.planned];
    const mockRoutines = [mockRoutine.unsynced];
    const mockWorkoutDetails = [mockWorkoutDetail.past];
    const mockRoutineDetails = [mockRoutineDetail.past];

    const mockNestedExercises: NestedExercise[] = [
      {
        ...mockExercise.synced,
        userExercise: null,
      },
    ];

    const mockNestedWorkouts: NestedWorkout[] = [
      {
        ...mockWorkout.planned,
        details: mockWorkoutDetails,
      },
    ];

    const mockNestedRoutines: NestedRoutine[] = [
      {
        ...mockRoutine.unsynced,
        details: mockRoutineDetails,
      },
    ];

    it("모든 서비스 메서드를 올바르게 호출한다", async () => {
      mockExerciseService.getAllLocalExercises.mockResolvedValue(mockExercises);
      mockWorkoutService.getAllWorkouts.mockResolvedValue(mockWorkouts);
      mockRoutineService.getAllLocalRoutines.mockResolvedValue(mockRoutines);
      mockWorkoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds.mockResolvedValue(
        mockWorkoutDetails
      );
      mockRoutineDetailService.getAllLocalRoutineDetailsByRoutineIds.mockResolvedValue(
        mockRoutineDetails
      );

      mockSyncAllAdapter.createNestedExercises.mockReturnValue(
        mockNestedExercises
      );

      (mockSyncAllAdapter.createNestedStructure as jest.Mock)
        .mockReturnValueOnce(mockNestedWorkouts)
        .mockReturnValueOnce(mockNestedRoutines);

      mockSyncAllApi.syncAllToServer.mockResolvedValue(undefined);

      await service.overWriteToServer(mockUserId);

      expect(mockExerciseService.getAllLocalExercises).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockWorkoutService.getAllWorkouts).toHaveBeenCalledWith(
        mockUserId
      );
      expect(mockRoutineService.getAllLocalRoutines).toHaveBeenCalledWith(
        mockUserId
      );

      expect(
        mockWorkoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds
      ).toHaveBeenCalledWith([mockWorkout.planned.id]);
      expect(
        mockRoutineDetailService.getAllLocalRoutineDetailsByRoutineIds
      ).toHaveBeenCalledWith([mockRoutine.unsynced.id]);

      expect(mockSyncAllAdapter.createNestedExercises).toHaveBeenCalledWith(
        mockExercises
      );
      expect(mockSyncAllAdapter.createNestedStructure).toHaveBeenCalledWith(
        mockWorkouts,
        mockWorkoutDetails,
        "workoutId"
      );
      expect(mockSyncAllAdapter.createNestedStructure).toHaveBeenCalledWith(
        mockRoutines,
        mockRoutineDetails,
        "routineId"
      );

      expect(mockSyncAllApi.syncAllToServer).toHaveBeenCalledWith({
        userId: mockUserId,
        nestedExercises: mockNestedExercises,
        nestedWorkouts: mockNestedWorkouts,
        nestedRoutines: mockNestedRoutines,
      });
    });

    it("에러가 발생하면 그대로 전파한다", async () => {
      const mockError = new Error("에러에러");
      mockExerciseService.getAllLocalExercises.mockRejectedValue(mockError);

      await expect(service.overWriteToServer(mockUserId)).rejects.toThrow(
        mockError
      );

      expect(mockWorkoutService.getAllWorkouts).not.toHaveBeenCalled();
      expect(mockSyncAllApi.syncAllToServer).not.toHaveBeenCalled();
    });

    it("workout과 routine이 없는 경우에도 정상 동작한다", async () => {
      mockExerciseService.getAllLocalExercises.mockResolvedValue(mockExercises);
      mockWorkoutService.getAllWorkouts.mockResolvedValue([]);
      mockRoutineService.getAllLocalRoutines.mockResolvedValue([]);
      mockWorkoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds.mockResolvedValue(
        []
      );
      mockRoutineDetailService.getAllLocalRoutineDetailsByRoutineIds.mockResolvedValue(
        []
      );

      mockSyncAllAdapter.createNestedExercises.mockReturnValue(
        mockNestedExercises
      );
      (mockSyncAllAdapter.createNestedStructure as jest.Mock)
        .mockReturnValueOnce([])
        .mockReturnValueOnce([]);

      mockSyncAllApi.syncAllToServer.mockResolvedValue(undefined);

      await service.overWriteToServer(mockUserId);

      expect(
        mockWorkoutDetailService.getAllLocalWorkoutDetailsByWorkoutIds
      ).toHaveBeenCalledWith([]);
      expect(
        mockRoutineDetailService.getAllLocalRoutineDetailsByRoutineIds
      ).toHaveBeenCalledWith([]);

      expect(mockSyncAllApi.syncAllToServer).toHaveBeenCalledWith({
        userId: mockUserId,
        nestedExercises: mockNestedExercises,
        nestedWorkouts: [],
        nestedRoutines: [],
      });
    });
  });
});
