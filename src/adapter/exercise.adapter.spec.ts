import {
  mockLocalExercises,
  mockServerResponseExercises,
} from "@/__mocks__/exercise.mock";
import { mergeServerExerciseData } from "@/adapter/exercise.adapter";

describe("mergeServerExerciseData", () => {
  it("로컬 데이터 중 serverId가 없는 항목은 리턴값에 포함된다", () => {
    const localExerciseWithoutServerId = mockLocalExercises[0];

    const merged = mergeServerExerciseData(
      mockServerResponseExercises,
      mockLocalExercises
    );

    const found = merged.find(
      (item) => item.id === localExerciseWithoutServerId.id
    );

    expect(found).toBeDefined();
    expect(found?.serverId).toBeNull();
  });
  it("서버 데이터 중 로컬과 serverId가 매칭되지 않는 항목은 리턴값에 포함된다", () => {
    const unmatchedServerExercise = mockServerResponseExercises.find(
      (ex) => ex.id === 5
    );

    const merged = mergeServerExerciseData(
      mockServerResponseExercises,
      mockLocalExercises
    );
    const found = merged.find(
      (item) => item.serverId === unmatchedServerExercise?.id
    );
    expect(found).toBeDefined();
    expect(found).toMatchObject({
      name: unmatchedServerExercise?.name,
      serverId: unmatchedServerExercise?.id,
    });
  });
  it("서버 데이터와 로컬 데이터가 serverId로 매칭되며, 로컬데이터의 isSynced === false 인 경우 로컬데이터만 리턴값에 포함된다", () => {
    const local = mockLocalExercises.find((ex) => ex.serverId === 3);
    const server = mockServerResponseExercises.find((ex) => ex.id === 3);

    expect(local?.isSynced).toBe(false);

    const merged = mergeServerExerciseData(
      mockServerResponseExercises,
      mockLocalExercises
    );

    const found = merged.find((ex) => ex.serverId === 3);

    expect(found).toBe(local);
    expect(found).not.toBe(server);
  });
  it("복합 시나리오: 로컬과 서버가 여러 항목을 동시에 가지고 있을 때 올바르게 머지된다", () => {
    const merged = mergeServerExerciseData(
      mockServerResponseExercises,
      mockLocalExercises
    );

    // 1) 로컬에만 존재하는 항목(serverId=null)이 포함되는지
    const localNoServerId = mockLocalExercises[0];
    const foundNoServerId = merged.find(
      (item) => item.id === localNoServerId.id
    );
    expect(foundNoServerId).toBeDefined();
    expect(foundNoServerId?.serverId).toBeNull();

    // 2) 서버에만 존재(id=5)하는 항목이 새로 추가되는지
    const unmatchedServerExercise = mockServerResponseExercises.find(
      (ex) => ex.id === 5
    );
    const foundUnmatchedServer = merged.find(
      (item) => item.serverId === unmatchedServerExercise?.id
    );
    expect(foundUnmatchedServer).toBeDefined();
    expect(foundUnmatchedServer).toMatchObject({
      name: unmatchedServerExercise?.name,
      serverId: unmatchedServerExercise?.id,
    });

    // 3) 로컬 isSynced=false 이고 serverId 일치하면 로컬 데이터가 우선

    const localFalse = mockLocalExercises.find(
      (ex) => ex.serverId === 3 && ex.isSynced === false
    );
    expect(localFalse).toBeDefined();
    const foundFalse = merged.find((item) => item.serverId === 3);
    expect(foundFalse).toBe(localFalse);

    // 4) 로컬 isSynced=true 이고 serverId 일치하면 서버 데이터로 덮어쓰되, 로컬 id는 유지
    const localTrue = mockLocalExercises.find(
      (ex) => ex.serverId === 2 && ex.isSynced === true
    );
    expect(localTrue).toBeDefined();

    const foundTrue = merged.find((item) => item.serverId === 2);

    expect(foundTrue).not.toBe(localTrue);
    expect(foundTrue?.id).toBe(localTrue?.id);
    expect(foundTrue?.serverId).toBe(2);
  });
});
