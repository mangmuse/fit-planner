import { createMockExerciseAdapter } from "@/__mocks__/adapters/exercise.adapter.mock";
import { createMockExerciseApi } from "@/__mocks__/api/exercise.api.mock";
import { mockExercise } from "@/__mocks__/exercise.mock";
import { createMockExerciseRepository } from "@/__mocks__/repositories/exercise.repository.mock";
import { ExerciseService } from "@/services/exercise.service";
import { ClientExercise, LocalExercise, Saved } from "@/types/models";
import { IExerciseService } from "@/types/services";

const mockRepository = createMockExerciseRepository();
const mockAdapter = createMockExerciseAdapter();
const mockApi = createMockExerciseApi();

describe("ExerciseService", () => {
  let service: IExerciseService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExerciseService(mockRepository, mockAdapter, mockApi);
  });

  describe("core service", () => {
    describe("getExerciseWithServerId", () => {
      it("서버 ID로 운동을 찾는다", async () => {
        const serverId = 123;
        const mockEx = mockExercise.synced;
        mockRepository.findOneByServerId.mockResolvedValue(mockEx);

        const result = await service.getExerciseWithServerId(serverId);

        expect(result).toEqual(mockEx);
        expect(mockRepository.findOneByServerId).toHaveBeenCalledWith(serverId);
      });
    });

    describe("getAllLocalExercises", () => {
      it("모든 운동을 가져온다", async () => {
        const mockExercises: Saved<LocalExercise>[] = [mockExercise.synced];
        mockRepository.findAll.mockResolvedValue(mockExercises);
        const result = await service.getAllLocalExercises("user-123");
        expect(result).toEqual(mockExercises);
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
        expect(mockRepository.findAll).toHaveBeenCalledWith("user-123");
      });
    });

    describe("getExerciseWithLocalId", () => {
      it("로컬 ID로 운동을 찾는다", async () => {
        const localId = 5;
        const mockEx = mockExercise.synced;
        mockRepository.findOneById.mockResolvedValue(mockEx);

        const result = await service.getExerciseWithLocalId(localId);

        expect(result).toEqual(mockEx);
        expect(mockRepository.findOneById).toHaveBeenCalledWith(localId);
      });
    });

    describe("addLocalExercise", () => {
      const newExercise = {
        name: "새 운동",
        category: "카테고리",
        userId: "user-123",
      };
      const toInsert = {
        ...newExercise,
        imageUrl: "",
        createdAt: expect.any(String),
        isCustom: true,
        isBookmarked: false,
        serverId: null,
        unit: "kg",
        exerciseMemo: null,
        id: undefined,
        isSynced: false,
      };
      it("새로운 운동을 추가한다", async () => {
        await service.addLocalExercise(newExercise);
        expect(mockRepository.add).toHaveBeenCalledWith(toInsert);
      });

      it("userId가 없으면 에러를 던진다", async () => {
        await expect(
          service.addLocalExercise({
            name: "운동",
            category: "카테고리",
            userId: "",
          })
        ).rejects.toThrow("userId가 없습니다");
      });

      it("운동 추가도중 에러 발생시 에러를 전파한다", async () => {
        const mockError = new Error("운동 추가 실패");

        mockRepository.add.mockRejectedValue(mockError);

        await expect(service.addLocalExercise(newExercise)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("updateLocalExercise", () => {
      const updateInput = {
        id: 5,
        name: "업데이트된 운동",
        isBookmarked: true,
      };
      it("운동을 업데이트한다", async () => {
        mockRepository.update.mockResolvedValue(1);
        await service.updateLocalExercise(updateInput);
        expect(mockRepository.update).toHaveBeenCalledWith(updateInput.id, {
          ...updateInput,
          isSynced: false,
        });
      });

      it("id를 전달하지 않을경우 에러를 던진다", async () => {
        await expect(
          service.updateLocalExercise({ name: "운동" })
        ).rejects.toThrow("id가 없습니다");
      });

      it("운동 업데이트 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("업데이트 실패");
        mockRepository.update.mockRejectedValueOnce(mockError);
        await expect(service.updateLocalExercise(updateInput)).rejects.toThrow(
          mockError
        );
      });
    });

    describe("toggleLocalBookmark", () => {
      it("북마크를 토글한다", async () => {
        const localId = 5;
        const nextValue = true;
        mockRepository.update.mockResolvedValueOnce(5);

        await service.toggleLocalBookmark(localId, nextValue);

        expect(mockRepository.update).toHaveBeenCalledWith(localId, {
          isBookmarked: nextValue,
          isSynced: false,
          updatedAt: expect.any(String),
        });
      });

      it("토글 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("북마크 토글 실패");
        const localId = 5;
        const nextValue = true;
        mockRepository.update.mockRejectedValueOnce(mockError);

        await expect(
          service.toggleLocalBookmark(localId, nextValue)
        ).rejects.toThrow(mockError);
      });
    });
  });

  describe("sync service", () => {
    describe("overwriteWithServerExercises", () => {
      const userId = "user-123";
      const mockServerData = [mockExercise.server];
      const mockToInsert = [
        {
          ...mockExercise.server,
          serverId: mockExercise.server.id,
          isSynced: true,
        },
      ];

      it("exercise 를 서버 데이터로 덮어쓴다", async () => {
        mockApi.fetchExercisesFromServer.mockResolvedValue(mockServerData);

        await service.overwriteWithServerExercises(userId);

        expect(mockApi.fetchExercisesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).toHaveBeenCalledTimes(1);
        expect(mockRepository.bulkAdd).toHaveBeenCalledWith(mockToInsert);
      });

      it("서버 데이터가 없으면 아무것도 하지 않는다", async () => {
        mockApi.fetchExercisesFromServer.mockResolvedValue([]);
        await service.overwriteWithServerExercises(userId);
        expect(mockApi.fetchExercisesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).not.toHaveBeenCalled();
        expect(mockRepository.bulkAdd).not.toHaveBeenCalled();
      });

      it("api 통신 도중 에러 발생시 해당 에러를 전파한다", async () => {
        const mockError = new Error("서버 통신 실패");
        mockApi.fetchExercisesFromServer.mockRejectedValue(mockError);
        await expect(
          service.overwriteWithServerExercises(userId)
        ).rejects.toThrow(mockError);
      });
    });

    describe("syncExercisesFromServerLocalFirst", () => {
      const serverData: ClientExercise[] = [mockExercise.server];
      const localData: Saved<LocalExercise>[] = [mockExercise.bookmarked];
      const merged: Saved<LocalExercise>[] = [mockExercise.synced];
      const userId = "user-123";
      it("서버 데이터를 로컬데이터에 머지한다", async () => {
        mockApi.fetchExercisesFromServer.mockResolvedValue(serverData);
        mockRepository.findAll.mockResolvedValue(localData);
        mockAdapter.mergeServerExerciseData.mockReturnValue(merged);

        await service.syncExercisesFromServerLocalFirst(userId);

        expect(mockApi.fetchExercisesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
        expect(mockAdapter.mergeServerExerciseData).toHaveBeenCalledWith(
          serverData,
          localData
        );
        expect(mockRepository.clear).toHaveBeenCalledTimes(1);
        expect(mockRepository.bulkPut).toHaveBeenCalledWith(merged);
      });

      it("서버 데이터가 없으면 아무것도 하지 않는다", async () => {
        mockApi.fetchExercisesFromServer.mockResolvedValue([]);
        await service.syncExercisesFromServerLocalFirst(userId);

        expect(mockRepository.findAll).not.toHaveBeenCalled();
        expect(mockApi.fetchExercisesFromServer).toHaveBeenCalledWith(userId);
        expect(mockRepository.clear).not.toHaveBeenCalled();
        expect(mockRepository.bulkPut).not.toHaveBeenCalled();
      });
    });

    describe("syncFromServerIfNeeded", () => {
      const userId = "user-123";

      it("syncPromise가 있으면 기존 프로미스를 반환한다", async () => {
        const existingPromise = Promise.resolve();
        service.syncPromise = existingPromise;

        const result = service.syncFromServerIfNeeded(userId);

        expect(result).toBe(existingPromise);
      });

      it("syncPromise가 null이고 로컬 데이터가 없으면 새로운 프로미스를 생성하고 서버 동기화를 실행한다", async () => {
        service.syncPromise = null;

        const getAllSpy = jest
          .spyOn(service, "getAllLocalExercises")
          .mockResolvedValue([]);
        const syncSpy = jest
          .spyOn(service, "syncExercisesFromServerLocalFirst")
          .mockResolvedValue();

        const result = service.syncFromServerIfNeeded(userId);

        expect(result).toBe(service.syncPromise);
        expect(service.syncPromise).not.toBeNull();

        await result;

        expect(getAllSpy).toHaveBeenCalledWith(userId);
        expect(syncSpy).toHaveBeenCalledWith(userId);
        expect(service.syncPromise).toBeNull();

        getAllSpy.mockRestore();
        syncSpy.mockRestore();
      });

      it("syncPromise가 null이고 로컬 데이터가 있으면 서버 동기화는 하지 않는다", async () => {
        service.syncPromise = null;

        const mockLocalExercises = [mockExercise.synced];
        const getAllSpy = jest
          .spyOn(service, "getAllLocalExercises")
          .mockResolvedValue(mockLocalExercises);
        const syncSpy = jest
          .spyOn(service, "syncExercisesFromServerLocalFirst")
          .mockResolvedValue();

        const result = service.syncFromServerIfNeeded(userId);

        expect(result).toBe(service.syncPromise);
        expect(service.syncPromise).not.toBeNull();

        await result;

        expect(getAllSpy).toHaveBeenCalledWith(userId);
        expect(syncSpy).not.toHaveBeenCalled();
        expect(service.syncPromise).toBeNull();

        getAllSpy.mockRestore();
        syncSpy.mockRestore();
      });

      it("syncPromise가 있으면 그것을 반환한다", () => {
        const existingPromise = Promise.resolve();
        service.syncPromise = existingPromise;

        const result = service.syncFromServerIfNeeded(userId);

        expect(result).toBe(existingPromise);
      });
    });

    // describe("syncToServerExercises", () => {
    //   const unsyncedDetails = [
    //     { ...mockExercise.synced, id: 5, isSynced: false },
    //   ];
    //   const userId = "user-123";
    //   const mockServerResponse: SyncExercisesToServerResponse = {
    //     success: true,
    //     updated: [
    //       {
    //         localId: unsyncedDetails[0].id!,
    //         serverId: unsyncedDetails[0].serverId || 0,
    //       },
    //     ],
    //   };

    //   it("local exercise들을 서버에 동기화한다", async () => {
    //     mockRepository.findAllUnsynced.mockResolvedValue(unsyncedDetails);
    //     mockApi.postExercisesToServer.mockResolvedValue(mockServerResponse);

    //     await service.syncToServerExercises(userId);

    //     expect(mockRepository.update).toHaveBeenCalledWith(5, {
    //       isSynced: true,
    //       serverId: mockServerResponse.updated[0].serverId,
    //     });
    //   });

    //   it("unsynced exercise가 없는경우 api호출은 하지만 update는 하지않는다", async () => {
    //     const unsynced = [];
    //     const data = {
    //       success: true,
    //       updated: [],
    //     };
    //     mockRepository.findAllUnsynced.mockResolvedValue(unsynced);
    //     mockApi.postExercisesToServer.mockResolvedValue(data);

    //     await service.syncToServerExercises(userId);

    //     expect(mockApi.postExercisesToServer).toHaveBeenCalledWith(
    //       unsynced,
    //       userId
    //     );
    //     expect(mockRepository.update).not.toHaveBeenCalled();
    //   });

    //   it("서버 통신 도중 에러 발생시 해당 에러를 전파한다", async () => {
    //     const mockError = new Error("서버 통신 실패");
    //     mockRepository.findAllUnsynced.mockResolvedValue(unsyncedDetails);
    //     mockApi.postExercisesToServer.mockRejectedValue(mockError);
    //     await expect(service.syncToServerExercises(userId)).rejects.toThrow(
    //       mockError
    //     );
    //   });
    // });
  });
});
