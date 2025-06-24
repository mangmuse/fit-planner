import { createMockRoutineApi } from "@/__mocks__/api/routine.api.mock";
import { createMockRoutineRepository } from "@/__mocks__/repositories/routine.repository.mock";
import { mockRoutine } from "@/__mocks__/routine.mock";
import { RoutineService } from "@/services/routine.service";
import { IRoutineService } from "@/types/services";
import { SyncRoutinesToServerResponse } from "@/api/routine.api";

const mockRepository = createMockRoutineRepository();
const mockApi = createMockRoutineApi();

describe("RoutineService", () => {
  let service: IRoutineService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoutineService(mockRepository, mockApi);
  });

  describe("core service", () => {
    describe("getAllLocalRoutines", () => {
      const userId = "user-123";
      it("사용자의 모든 루틴을 리턴한다", async () => {
        const mockRoutines = [mockRoutine.synced];
        mockRepository.findAllByUserId.mockResolvedValue(mockRoutines);

        const result = await service.getAllLocalRoutines(userId);

        expect(result).toEqual(mockRoutines);
        expect(mockRepository.findAllByUserId).toHaveBeenCalledWith(userId);
      });
    });

    describe("getRoutineByServerId", () => {
      const serverId = "server-123";
      it("서버 ID로 루틴을 찾는다", async () => {
        const mockR = { ...mockRoutine.synced, serverId };
        mockRepository.findOneByServerId.mockResolvedValue(mockR);

        const result = await service.getRoutineByServerId(serverId);

        expect(result).toEqual(mockR);
        expect(mockRepository.findOneByServerId).toHaveBeenCalledWith(serverId);
      });
    });

    describe("getRoutineByLocalId", () => {
      const localId = 5;
      it("로컬 ID로 루틴을 찾는다", async () => {
        const mockR = { ...mockRoutine.synced, id: localId };
        mockRepository.findOneById.mockResolvedValue(mockR);

        const result = await service.getRoutineByLocalId(localId);

        expect(result).toEqual(mockR);
        expect(mockRepository.findOneById).toHaveBeenCalledWith(localId);
      });
    });

    describe("addLocalRoutine", () => {
      const userId = "user-123";
      const name = "새로운 루틴";
      const description = "루틴 설명";
      const mockInput = { userId, name, description };
      const mockId = 1;
      it("새로운 루틴을 추가한다", async () => {
        mockRepository.add.mockResolvedValue(mockId);
        const result = await service.addLocalRoutine(mockInput);
        expect(result).toBe(mockId);
        expect(mockRepository.add).toHaveBeenCalledWith({
          ...mockInput,
          createdAt: expect.any(String),
          isSynced: false,
          serverId: null,
          description: description || "",
        });
      });
      it("루틴 추가도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("루틴 추가 실패");
        mockRepository.add.mockRejectedValue(mockError);
        await expect(service.addLocalRoutine(mockInput)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("updateLocalRoutine", () => {
      const mockUpdate = { id: 1, name: "업데이트된 루틴" };
      it("루틴을 업데이트한다", async () => {
        mockRepository.update.mockResolvedValue(1);
        await service.updateLocalRoutine(mockUpdate);
        expect(mockRepository.update).toHaveBeenCalledWith(mockUpdate.id, {
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
        mockRepository.update.mockRejectedValue(mockError);
        await expect(service.updateLocalRoutine(mockUpdate)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("deleteLocalRoutine", () => {
      it("루틴을 삭제한다", async () => {
        const routineId = 1;
        mockRepository.delete.mockResolvedValue();
        await service.deleteLocalRoutine(routineId);
        expect(mockRepository.delete).toHaveBeenCalledWith(routineId);
      });
      it("삭제 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("삭제 실패");
        mockRepository.delete.mockRejectedValue(mockError);
        await expect(service.deleteLocalRoutine(1)).rejects.toThrow(mockError);
      });
    });
  });

  describe("sync service", () => {
    describe("syncToServerRoutines", () => {
      const mockAllRoutines = [mockRoutine.unsynced, mockRoutine.synced];
      it("모든 local routines를 서버에 동기화한다", async () => {
        mockRepository.findAll.mockResolvedValue(mockAllRoutines);
        mockRepository.update.mockResolvedValue(1);
        mockApi.postRoutinesToServer.mockResolvedValue({
          success: true,
          updated: [
            { localId: mockRoutine.unsynced.id!, serverId: "server-123" },
          ],
        });
        await service.syncToServerRoutines();

        expect(mockRepository.findAll).toHaveBeenCalled();
        expect(mockApi.postRoutinesToServer).toHaveBeenCalledWith([
          mockRoutine.unsynced,
        ]);
        expect(mockRepository.update).toHaveBeenCalledWith(
          mockRoutine.unsynced.id!,
          {
            serverId: "server-123",
            isSynced: true,
          }
        );
      });

      it("local routines이 없을경우 api 호출은 하지만 update는 하지않는다", async () => {
        mockRepository.findAll.mockResolvedValue([]);
        mockApi.postRoutinesToServer.mockResolvedValue({
          success: true,
          updated: [],
        });

        await service.syncToServerRoutines();

        expect(mockRepository.findAll).toHaveBeenCalled();
        expect(mockApi.postRoutinesToServer).toHaveBeenCalledWith([]);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
    });

    describe("overwriteWithServerRoutines", () => {
      const userId = "user-123";
      const mockServerData = [mockRoutine.server];

      it("서버 데이터를 받아 로컬DB에 덮어씌운다", async () => {
        mockApi.fetchRoutinesFromServer.mockResolvedValue(mockServerData);
        mockRepository.bulkAdd.mockResolvedValue(1);

        await service.overwriteWithServerRoutines(userId);

        expect(mockApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).toHaveBeenCalled();
        expect(mockRepository.bulkAdd).toHaveBeenCalledWith([
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
        mockApi.fetchRoutinesFromServer.mockResolvedValue([]);
        await service.overwriteWithServerRoutines(userId);
        expect(mockApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).not.toHaveBeenCalled();
        expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
      });

      it("서버에서 데이터를 가져오는 도중 에러가 발생할경우 해당 에러를 전파한다", async () => {
        const mockError = new Error("서버 에러");
        mockApi.fetchRoutinesFromServer.mockRejectedValue(mockError);
        await expect(
          service.overwriteWithServerRoutines(userId)
        ).rejects.toThrow(mockError);
        expect(mockApi.fetchRoutinesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).not.toHaveBeenCalled();
        expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
      });
    });
  });
});
