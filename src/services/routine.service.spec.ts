import { mockRoutineRepository, mockRoutineApi } from "@/__mocks__/lib/di";
import { mockRoutine } from "@/__mocks__/routine.mock";
import { RoutineService } from "@/services/routine.service";
import { IRoutineService } from "@/types/services";
import { SyncRoutinesToServerResponse } from "@/api/routine.api";

describe("RoutineService", () => {
  let service: IRoutineService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoutineService(mockRoutineRepository, mockRoutineApi);
  });

  describe("core service", () => {
    describe("getAllLocalRoutines", () => {
      const userId = "user-123";
      it("사용자의 모든 루틴을 리턴한다", async () => {
        const mockRoutines = [mockRoutine.synced];
        mockRoutineRepository.findAllByUserId.mockResolvedValue(mockRoutines);

        const result = await service.getAllLocalRoutines(userId);

        expect(result).toEqual(mockRoutines);
        expect(mockRoutineRepository.findAllByUserId).toHaveBeenCalledWith(userId);
      });
    });

    describe("getRoutineByServerId", () => {
      const serverId = "server-123";
      it("서버 ID로 루틴을 찾는다", async () => {
        const mockR = { ...mockRoutine.synced, serverId };
        mockRoutineRepository.findOneByServerId.mockResolvedValue(mockR);

        const result = await service.getRoutineByServerId(serverId);

        expect(result).toEqual(mockR);
        expect(mockRoutineRepository.findOneByServerId).toHaveBeenCalledWith(serverId);
      });
    });

    describe("getRoutineByLocalId", () => {
      const localId = 5;
      it("로컬 ID로 루틴을 찾는다", async () => {
        const mockR = { ...mockRoutine.synced, id: localId };
        mockRoutineRepository.findOneById.mockResolvedValue(mockR);

        const result = await service.getRoutineByLocalId(localId);

        expect(result).toEqual(mockR);
        expect(mockRoutineRepository.findOneById).toHaveBeenCalledWith(localId);
      });
    });

    describe("addLocalRoutine", () => {
      const userId = "user-123";
      const name = "새로운 루틴";
      const description = "루틴 설명";
      const mockInput = { userId, name, description };
      const mockId = 1;
      it("새로운 루틴을 추가한다", async () => {
        mockRoutineRepository.add.mockResolvedValue(mockId);
        const result = await service.addLocalRoutine(mockInput);
        expect(result).toBe(mockId);
        expect(mockRoutineRepository.add).toHaveBeenCalledWith({
          ...mockInput,
          createdAt: expect.any(String),
          isSynced: false,
          serverId: null,
          description: description || "",
        });
      });
      it("루틴 추가도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("루틴 추가 실패");
        mockRoutineRepository.add.mockRejectedValue(mockError);
        await expect(service.addLocalRoutine(mockInput)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("updateLocalRoutine", () => {
      const mockUpdate = { id: 1, name: "업데이트된 루틴" };
      it("루틴을 업데이트한다", async () => {
        mockRoutineRepository.update.mockResolvedValue(1);
        await service.updateLocalRoutine(mockUpdate);
        expect(mockRoutineRepository.update).toHaveBeenCalledWith(mockUpdate.id, {
          ...mockUpdate,
          updatedAt: expect.any(String),
          isSynced: false,
        });
      });

      it("루틴 ID가 없으면 에러를 던진다", async () => {
        const mockError = new Error("routine id는 꼭 전달해주세요");

        await expect(
          service.updateLocalRoutine({ name: "루틴" })
        ).rejects.toThrow(mockError);
      });

      it("업데이트 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("업데이트 실패");
        mockRoutineRepository.update.mockRejectedValue(mockError);
        await expect(service.updateLocalRoutine(mockUpdate)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("deleteLocalRoutine", () => {
      it("루틴을 삭제한다", async () => {
        const routineId = 1;
        mockRoutineRepository.delete.mockResolvedValue();
        await service.deleteLocalRoutine(routineId);
        expect(mockRoutineRepository.delete).toHaveBeenCalledWith(routineId);
      });
      it("삭제 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("삭제 실패");
        mockRoutineRepository.delete.mockRejectedValue(mockError);
        await expect(service.deleteLocalRoutine(1)).rejects.toThrow(mockError);
      });
    });
  });

  describe("sync service", () => {
    // describe("syncToServerRoutines", () => {
    //   const mockAllRoutines = [mockRoutine.unsynced, mockRoutine.synced];
    //   it("모든 local routines를 서버에 동기화한다", async () => {
    //     mockRoutineRepository.findAll.mockResolvedValue(mockAllRoutines);
    //     mockRoutineRepository.update.mockResolvedValue(1);
    //     mockRoutineApi.postRoutinesToServer.mockResolvedValue({
    //       success: true,
    //       updated: [
    //         { localId: mockRoutine.unsynced.id!, serverId: "server-123" },
    //       ],
    //     });
    //     await service.syncToServerRoutines();

    //     expect(mockRoutineRepository.findAll).toHaveBeenCalled();
    //     expect(mockRoutineApi.postRoutinesToServer).toHaveBeenCalledWith([
    //       mockRoutine.unsynced,
    //     ]);
    //     expect(mockRoutineRepository.update).toHaveBeenCalledWith(
    //       mockRoutine.unsynced.id!,
    //       {
    //         serverId: "server-123",
    //         isSynced: true,
    //       }
    //     );
    //   });

    //   it("local routines이 없을경우 api 호출은 하지만 update는 하지않는다", async () => {
    //     mockRoutineRepository.findAll.mockResolvedValue([]);
    //     mockRoutineApi.postRoutinesToServer.mockResolvedValue({
    //       success: true,
    //       updated: [],
    //     });

    //     await service.syncToServerRoutines();

    //     expect(mockRoutineRepository.findAll).toHaveBeenCalled();
    //     expect(mockRoutineApi.postRoutinesToServer).toHaveBeenCalledWith([]);
    //     expect(mockRoutineRepository.update).not.toHaveBeenCalled();
    //   });
    // });

    describe("overwriteWithServerRoutines", () => {
      const userId = "user-123";
      const mockServerData = [mockRoutine.server];

      it("서버 데이터를 받아 로컬DB에 덮어씌운다", async () => {
        mockRoutineApi.fetchRoutinesFromServer.mockResolvedValue(mockServerData);
        mockRoutineRepository.bulkAdd.mockResolvedValue(1);

        await service.overwriteWithServerRoutines(userId);

        expect(mockRoutineApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRoutineRepository.clear).toHaveBeenCalled();
        expect(mockRoutineRepository.bulkAdd).toHaveBeenCalledWith([
          {
            id: undefined,
            userId: mockServerData[0].userId,
            serverId: mockServerData[0].id,
            name: mockServerData[0].name,
            description: mockServerData[0].description || "",
            isSynced: true,
            createdAt: mockServerData[0].createdAt,
            updatedAt: mockServerData[0].updatedAt,
          },
        ]);
      });

      it("서버 데이터가 빈배열인경우 clear를 하지않고 리턴한다", async () => {
        mockRoutineApi.fetchRoutinesFromServer.mockResolvedValue([]);
        await service.overwriteWithServerRoutines(userId);
        expect(mockRoutineApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRoutineRepository.clear).not.toHaveBeenCalled();
        expect(mockRoutineRepository.bulkAdd).not.toHaveBeenCalled();
      });

      it("서버에서 데이터를 가져오는 도중 에러가 발생할경우 해당 에러를 전파한다", async () => {
        const mockError = new Error("서버 에러");
        mockRoutineApi.fetchRoutinesFromServer.mockRejectedValue(mockError);
        await expect(
          service.overwriteWithServerRoutines(userId)
        ).rejects.toThrow(mockError);
        expect(mockRoutineApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRoutineRepository.clear).not.toHaveBeenCalled();
        expect(mockRoutineRepository.bulkAdd).not.toHaveBeenCalled();
      });
    });
  });

  describe("updateLocalRoutineUpdatedAt", () => {
    it("루틴의 updatedAt을 업데이트한다", async () => {
      const routineId = 1;
      mockRoutineRepository.update.mockResolvedValue(1);
      await service.updateLocalRoutineUpdatedAt(routineId);
      expect(mockRoutineRepository.update).toHaveBeenCalledWith(routineId, {
        updatedAt: expect.any(String),
      });
    });
  });
});
