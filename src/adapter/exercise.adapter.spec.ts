import { exerciseAdapter } from "@/lib/di";
import {
  createMockExercise,
  createMockServerExercise,
} from "@/__mocks__/exercise.mock";
import { ClientExercise, LocalExercise } from "@/types/models";

describe("mergeServerExerciseData", () => {
  it("로컬에만 있는 데이터(serverId=null)는 결과에 그대로 포함되어야 한다", () => {
    const localOnlyItem = createMockExercise({ id: 1, serverId: null });
    const localExercises: LocalExercise[] = [localOnlyItem];
    const serverExercises: ClientExercise[] = [];

    const merged = exerciseAdapter.mergeServerExerciseData(
      serverExercises,
      localExercises
    );

    expect(merged).toHaveLength(1);
    expect(merged).toContainEqual(localOnlyItem);
  });

  it("서버에만 있는 데이터는 결과에 새로 추가되어야 한다", () => {
    const serverOnlyItem = createMockServerExercise({ id: 101 });
    const localExercises: LocalExercise[] = [];
    const serverExercises: ClientExercise[] = [serverOnlyItem];

    const merged = exerciseAdapter.mergeServerExerciseData(
      serverExercises,
      localExercises
    );

    expect(merged).toHaveLength(1);
    const found = merged[0];
    expect(found.serverId).toBe(serverOnlyItem.id);
    expect(found.name).toBe(serverOnlyItem.name);
    expect(found.isSynced).toBe(true);
  });

  describe("로컬과 서버에 모두 데이터가 있을 때 (ID로 매칭)", () => {
    it("로컬 데이터가 동기화되지 않았다면(isSynced=false), 로컬 데이터를 유지해야 한다 (Local First)", () => {
      const unsyncedLocal = createMockExercise({
        id: 1,
        serverId: 101,
        isSynced: false,
        name: "로컬에서 이름 수정",
      });
      const serverOriginal = createMockServerExercise({
        id: 101,
        name: "서버 원본 이름",
      });

      const localExercises = [unsyncedLocal];
      const serverExercises = [serverOriginal];

      const merged = exerciseAdapter.mergeServerExerciseData(
        serverExercises,
        localExercises
      );

      expect(merged).toHaveLength(1);
      expect(merged[0]).toEqual(unsyncedLocal);
    });

    it("로컬 데이터가 이미 동기화되었다면(isSynced=true), 서버 데이터로 덮어쓰되 로컬 id는 유지해야 한다 (Server First)", () => {
      const syncedLocal = createMockExercise({
        id: 1,
        serverId: 101,
        isSynced: true,
        name: "덮어쓰기 전 로컬 이름",
      });
      const serverUpdate = createMockServerExercise({
        id: 101,
        name: "서버에서 내린 새 이름",
      });

      const localExercises = [syncedLocal];
      const serverExercises = [serverUpdate];

      const merged = exerciseAdapter.mergeServerExerciseData(
        serverExercises,
        localExercises
      );

      expect(merged).toHaveLength(1);
      const found = merged[0];
      expect(found.name).toBe(serverUpdate.name);
      expect(found.id).toBe(syncedLocal.id);
      expect(found.isSynced).toBe(true);
    });
  });
});
