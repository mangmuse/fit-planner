import { mockWorkoutRepository, mockWorkoutApi } from "@/__mocks__/lib/di";
import { mockWorkout } from "@/__mocks__/workout.mock";
import { WorkoutService } from "@/services/workout.service";
import { IWorkoutService } from "@/types/services";

describe("WorkoutService", () => {
  let service: IWorkoutService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkoutService(mockWorkoutRepository, mockWorkoutApi);
  });

  describe("core service", () => {
    // ---- Core ---- //
    describe("getAllWorkouts", () => {
      const userId = "user-123";
      const mockWorkouts = [mockWorkout.planned];
      it("전달받은 유저의 모든 workouts를 가져온다", async () => {
        mockWorkoutRepository.findAllByUserIdOrderByDate.mockResolvedValue(
          mockWorkouts
        );
        const result = await service.getAllWorkouts(userId);
        expect(result).toEqual(mockWorkouts);
        expect(mockWorkoutRepository.findAllByUserIdOrderByDate).toHaveBeenCalledWith(
          userId
        );
      });
    });

    describe("getWorkoutWithServerId", () => {
      const mockW = mockWorkout.synced;
      const serverId = mockW.serverId;
      if (!serverId) {
        throw new Error("테스트용 serverId가 정의되어 있지 않습니다.");
      }

      it("serverId에 해당하는 workout을 반환한다", async () => {
        mockWorkoutRepository.findOneByServerId.mockResolvedValueOnce(mockW);
        const result = await service.getWorkoutWithServerId(serverId);
        expect(result).toEqual(mockW);
        expect(mockWorkoutRepository.findOneByServerId).toHaveBeenCalledWith(serverId);
      });
    });
    describe("getWorkoutWithLocalId", () => {
      const mockW = mockWorkout.synced;
      const mockId = mockW.id;
      if (!mockId) {
        throw new Error("테스트용 id가 정의되어 있지 않습니다.");
      }

      it("serverId에 해당하는 workout을 반환한다", async () => {
        mockWorkoutRepository.findOneById.mockResolvedValueOnce(mockW);
        const result = await service.getWorkoutWithLocalId(mockId);
        expect(result).toEqual(mockW);
        expect(mockWorkoutRepository.findOneById).toHaveBeenCalledWith(mockId);
      });
    });

    describe("getWorkoutByUserIdAndDate", () => {
      const mockUserId = "user-123";
      const mockDate = "2023-10-01";
      const mockW = { ...mockWorkout.planned, date: mockDate };
      it("유저ID와 날짜에 해당하는 workout을 반환한다", async () => {
        mockWorkoutRepository.findOneByUserIdAndDate.mockResolvedValueOnce(mockW);
        const result = await service.getWorkoutByUserIdAndDate(
          mockUserId,
          mockDate
        );
        expect(result).toEqual(mockW);
        expect(mockWorkoutRepository.findOneByUserIdAndDate).toHaveBeenCalledWith(
          mockUserId,
          mockDate
        );
      });
    });

    describe("addLocalWorkout", () => {
      const mockW = mockWorkout.planned;
      const userId = mockW.userId;
      const date = mockW.date;
      const addInput = {
        userId,
        date,
        createdAt: expect.any(String),
        isSynced: false,
        status: "EMPTY",
        serverId: null,
      };
      it("userId와 date에 해당하는 workout이 있을경우 그 workout을 바로 리턴한다", async () => {
        mockWorkoutRepository.findOneByUserIdAndDate.mockResolvedValueOnce(mockW);
        const result = await service.addLocalWorkout(userId, date);
        expect(result).toEqual(mockW);
        expect(mockWorkoutRepository.findOneByUserIdAndDate).toHaveBeenCalledWith(
          userId,
          date
        );
      });

      it("해당하는 workout이 없을경우 새로운 workout을 생성하고 리턴한다", async () => {
        const mockId = 3;

        mockWorkoutRepository.add.mockResolvedValueOnce(mockId);
        const mockGetWorkoutWithLocalId = jest
          .spyOn(service, "getWorkoutWithLocalId")
          .mockResolvedValueOnce(mockW);
        const mockGetWorkout = jest
          .spyOn(service, "getWorkoutByUserIdAndDate")
          .mockResolvedValueOnce(undefined);

        const result = await service.addLocalWorkout(userId, date);

        expect(result).toEqual(mockW);
        expect(mockGetWorkout).toHaveBeenCalledWith(userId, date);
        expect(mockWorkoutRepository.add).toHaveBeenCalledWith(addInput);
        expect(mockGetWorkoutWithLocalId).toHaveBeenCalledWith(mockId);
      });

      it("생성한 workout을 조회하지 못한경우 에러를 던진다", async () => {
        const mockError = new Error("Workout을 불러오지 못했습니다");

        jest
          .spyOn(service, "getWorkoutWithLocalId")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(service, "getWorkoutByUserIdAndDate")
          .mockResolvedValueOnce(undefined);

        await expect(service.addLocalWorkout(userId, date)).rejects.toThrow(
          mockError
        );
        expect(mockWorkoutRepository.add).toHaveBeenCalledWith(addInput);
      });
    });

    describe("updateLocalWorkout", () => {
      const mockW = { ...mockWorkout.planned, id: 1 };
      it("workout을 업데이트한다", async () => {
        const mockUpdateInput = {
          ...mockW,
          updatedAt: expect.any(String),
          isSynced: false,
        };
        mockWorkoutRepository.update.mockResolvedValueOnce(1);
        await service.updateLocalWorkout(mockW);
        expect(mockWorkoutRepository.update).toHaveBeenCalledWith(
          mockW.id,
          mockUpdateInput
        );
      });
      it("workout에 id가 없는경우 에러를 던진다", async () => {
        const mockW = { ...mockWorkout.planned, id: undefined };
        const mockError = new Error("workout id는 필수입니다");
        await expect(service.updateLocalWorkout(mockW)).rejects.toThrow(
          mockError
        );
        expect(mockWorkoutRepository.update).not.toHaveBeenCalled();
      });

      it("업데이트 도중 에러가 발생한경우 전파한다", async () => {
        const mockError = new Error("업데이트 실패");
        mockWorkoutRepository.update.mockRejectedValueOnce(mockError);
        await expect(service.updateLocalWorkout(mockW)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("deleteLocalWorkout", () => {
      const mockId = 1;
      it("workout을 삭제한다", async () => {
        await service.deleteLocalWorkout(mockId);
        expect(mockWorkoutRepository.delete).toHaveBeenCalledWith(mockId);
      });

      it("삭제 도중 에러가 발생한경우 전파한다", async () => {
        const mockError = new Error("삭제 실패");
        mockWorkoutRepository.delete.mockRejectedValueOnce(mockError);
        await expect(service.deleteLocalWorkout(mockId)).rejects.toThrow(
          mockError
        );
      });
    });
  });

  describe("sync service", () => {
    // describe("syncToServerWorkouts", () => {
    //   const mockAllWorkouts = [mockWorkout.planned, mockWorkout.synced];
    //   it("모든 local workouts를 서버에 동기화한다", async () => {
    //     mockWorkoutRepository.findAll.mockResolvedValue(mockAllWorkouts);
    //     mockWorkoutApi.postWorkoutsToServer.mockResolvedValue({
    //       success: true,
    //       updated: [
    //         { localId: mockWorkout.planned.id!, serverId: "server-123" },
    //       ],
    //     });
    //     await service.syncToServerWorkouts();

    //     expect(mockWorkoutRepository.findAll).toHaveBeenCalled();
    //     expect(mockWorkoutApi.postWorkoutsToServer).toHaveBeenCalledWith([
    //       mockWorkout.planned,
    //     ]);
    //     expect(mockWorkoutRepository.update).toHaveBeenCalledWith(
    //       mockWorkout.planned.id!,
    //       {
    //         serverId: "server-123",
    //         isSynced: true,
    //       }
    //     );
    //   });

    //   it("local workouts이 없을경우 api 호출은 하지만 update는 하지않는다", async () => {
    //     mockWorkoutRepository.findAll.mockResolvedValue([]);
    //     mockWorkoutApi.postWorkoutsToServer.mockResolvedValue({
    //       success: true,
    //       updated: [],
    //     });

    //     await service.syncToServerWorkouts();

    //     expect(mockWorkoutRepository.findAll).toHaveBeenCalled();
    //     expect(mockWorkoutApi.postWorkoutsToServer).toHaveBeenCalledWith([]);
    //     expect(mockWorkoutRepository.update).not.toHaveBeenCalled();
    //   });
    // });

    describe("overwriteWithServerWorkouts", () => {
      const userId = "user-123";
      it("서버의 데이터로 덮어씌운다", async () => {
        const serverData = [{ ...mockWorkout.server, date: "2025-10-01" }];
        mockWorkoutApi.fetchWorkoutsFromServer.mockResolvedValue(serverData);

        mockWorkoutRepository.bulkAdd.mockResolvedValue(serverData.length);
        await service.overwriteWithServerWorkouts(userId);
        expect(mockWorkoutApi.fetchWorkoutsFromServer).toHaveBeenCalledWith(userId);
        expect(mockWorkoutRepository.clear).toHaveBeenCalled();
        expect(mockWorkoutRepository.bulkAdd).toHaveBeenCalledWith(
          serverData.map((workout) => ({
            id: undefined,
            userId: workout.userId,
            serverId: workout.id,
            date: "2025-10-01",
            isSynced: true,
            status: "EMPTY",
            createdAt: expect.any(String),
            updatedAt: null,
          }))
        );
      });

      it("서버 데이터가 빈배열인경우 clear를 하지않고 리턴한다", async () => {
        mockWorkoutApi.fetchWorkoutsFromServer.mockResolvedValue([]);
        await service.overwriteWithServerWorkouts(userId);
        expect(mockWorkoutApi.fetchWorkoutsFromServer).toHaveBeenCalledWith(userId);
        expect(mockWorkoutRepository.clear).not.toHaveBeenCalled();
        expect(mockWorkoutRepository.bulkAdd).not.toHaveBeenCalled();
      });

      it("서버에서 데이터를 가져오는 도중 에러가 발생할경우 해당 에러를 전파한다", async () => {
        const mockError = new Error("서버 에러");
        mockWorkoutApi.fetchWorkoutsFromServer.mockRejectedValue(mockError);
        await expect(
          service.overwriteWithServerWorkouts(userId)
        ).rejects.toThrow(mockError);
        expect(mockWorkoutApi.fetchWorkoutsFromServer).toHaveBeenCalledWith(userId);
        expect(mockWorkoutRepository.clear).not.toHaveBeenCalled();
        expect(mockWorkoutRepository.bulkAdd).not.toHaveBeenCalled();
      });
    });
  });

  describe("query service", () => {
    describe("getThisMonthWorkouts", () => {
      it("전달받은 날짜 사이의 workout들을 반환한다", async () => {
        const startDate = "2025-10-01";
        const endDate = "2025-10-31";
        const mockWorkouts = [
          { ...mockWorkout.planned, date: "2025-10-10" },
          { ...mockWorkout.planned, date: "2025-10-20" },
        ];

        mockWorkoutRepository.findAllByDateRangeExcludeEmpty.mockResolvedValue(
          mockWorkouts
        );

        const result = await service.getThisMonthWorkouts(startDate, endDate);

        expect(result).toEqual(mockWorkouts);
        expect(
          mockWorkoutRepository.findAllByDateRangeExcludeEmpty
        ).toHaveBeenCalledWith(startDate, endDate);
      });
    });
  });
});
