jest.mock("@/services/exercise.service", () => ({
  getExerciseWithServerId: jest.fn().mockImplementation((serverId: number) => {
    const exercise = mockServerResponseExercises.find(
      (ex) => ex.id === serverId
    );
    return exercise ? { ...exercise, id: exercise.id - 100 } : undefined;
  }),
  getExerciseWithLocalId: jest.fn().mockImplementation((localId: number) => {
    return mockLocalExercises
      .map((ex) => ({ ...ex, serverId: ex.id ? +ex.id + 100 : null }))
      .find((ex) => ex.id === localId);
  }),
}));

jest.mock("@/services/workout.service", () => ({
  getWorkoutWithServerId: jest.fn().mockImplementation((serverId: string) => {
    return mockLocalWorkouts.find((w) => w.serverId === serverId);
  }),
  getWorkoutWithLocalId: jest.fn().mockImplementation((localId: number) => {
    return mockLocalWorkouts.find((w) => w.id === localId);
  }),
}));

jest.mock("@/lib/db");

import {
  mockLocalExercises,
  mockServerResponseExercises,
} from "@/__mocks__/exercise.mock";
import { mockLocalWorkouts } from "@/__mocks__/workout.mock";
import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
import {
  convertLocalWorkoutDetailToServer,
  convertServerWorkoutDetailToLocal,
  createDetail,
  getAddSetInputByLastSet,
  getNewDetails,
  getStartExerciseOrder,
} from "@/adapter/workoutDetail.adapter";
import { db } from "@/lib/db";

import { LocalWorkoutDetail } from "@/types/models";

const lastSet = {
  id: 1,
  exerciseId: 3,
  exerciseName: "스쿼트",
  exerciseOrder: 1,
  isDone: true,
  isSynced: true,
  reps: 0,
  weight: 0,
  rpe: 7,
  setOrder: 1,
  serverId: "mock-id",
  workoutId: 1,
  createdAt: "2025-02-11T02:50:05.917Z",
};

describe("createDetail", () => {
  const { exerciseName, exerciseId, exerciseOrder, setOrder, workoutId } =
    lastSet;
  const errorMessage =
    "exerciseName, exerciseId, exerciseOrder, setOrder, workoutId 는 필수 입력사항입니다.";

  describe("입력된 모든 필드가 반환 객체에 포함된다", () => {
    it("모든 필드를 입력한 경우", () => {
      const newDetail = createDetail(lastSet);
      expect(newDetail).toEqual(lastSet);
    });

    it("필수 항목만 입력한 경우", () => {
      const newDetail = createDetail({
        exerciseName,
        exerciseId,
        exerciseOrder,
        setOrder,
        workoutId,
      });

      expect(newDetail).not.toEqual(lastSet);
      expect(newDetail).toMatchObject({
        exerciseName,
        exerciseId,
        exerciseOrder,
        setOrder,
        workoutId,
      });
    });
  });

  it("exerciseName, exerciseId, exerciseOrder, setOrder, workoutId 를 입력하지 않으면 에러를 던진다", () => {
    // exerciseName X
    expect(() =>
      createDetail({
        exerciseName,
        exerciseId,
        exerciseOrder,
        workoutId,
      })
    ).toThrow(errorMessage);

    // exerciseId X
    expect(() =>
      createDetail({
        exerciseName,
        exerciseId,
        setOrder,
        workoutId,
      })
    ).toThrow(errorMessage);

    // exerciseOrder X
    expect(() =>
      createDetail({
        exerciseName,
        exerciseOrder,
        setOrder,
        workoutId,
      })
    ).toThrow(errorMessage);

    // setOrder X
    expect(() =>
      createDetail({
        exerciseId,
        exerciseOrder,
        setOrder,
        workoutId,
      })
    ).toThrow(errorMessage);

    // workoutId X
    expect(() =>
      createDetail({
        exerciseName,
        exerciseId,
        exerciseOrder,
        setOrder,
      })
    ).toThrow(errorMessage);
  });

  describe("입력하지 않은 필드의 기본값", () => {
    const detail = createDetail({
      exerciseName,
      exerciseId,
      exerciseOrder,
      setOrder,
      workoutId,
    });

    it("serverId", () => expect(detail.serverId).toBe(null));

    it("weight", () => expect(detail.weight).toBe(0));

    it("rpe", () => expect(detail.rpe).toBe(null));

    it("reps", () => expect(detail.reps).toBe(0));

    it("isDone", () => expect(detail.isDone).toBe(false));

    it("isSynced", () => expect(detail.isSynced).toBe(false));

    it("setOrder", () => expect(detail.setOrder).toBe(1));

    it("exerciseOrder", () => expect(detail.exerciseOrder).toBe(1));

    it("createdAt", () => expect(typeof detail.createdAt).toBe("string"));
  });
});

describe("getAddSetInputByLastSet", () => {
  it("반환값의 isSynced는 false이다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    expect(lastSet.isSynced).toBe(true);
    expect(result.isSynced).toBe(false);
  });
  it("반환값의 isDone은 false이다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    expect(lastSet.isDone).toBe(true);
    expect(result.isDone).toBe(false);
  });
  it("반환값의 setOrder는 입력값의 setOrder + 1 이다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    expect(lastSet.setOrder).toBe(1);
    expect(result.setOrder).toBe(2);
  });
  it("반환값의 id는 undefined, serverId는 null이다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    // id
    expect(lastSet.id).toBe(1);
    expect(result.id).toBe(undefined);

    // serverId
    expect(lastSet.serverId).toBe("mock-id");
    expect(result.serverId).toBe(null);
  });
  it("반환값의 rpe는 0이다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    expect(lastSet.rpe).toBe(7);
    expect(result.rpe).toBe(0);
  });
  it("반환값의 weight, reps, exerciseOrder, exerciseName, exerciseId 프로퍼티는 입력값과 동일하다", () => {
    const result = getAddSetInputByLastSet(lastSet);

    //weight
    expect(result.weight).toBe(lastSet.weight);

    //reps
    expect(result.reps).toBe(lastSet.reps);

    //exerciseOrder
    expect(result.exerciseOrder).toBe(lastSet.exerciseOrder);

    //exerciseName
    expect(result.exerciseName).toBe(lastSet.exerciseName);

    //exerciseId
    expect(result.exerciseId).toBe(lastSet.exerciseId);
  });
});

describe("getNewDetails", () => {
  const selectedExercises = [
    { id: 1, name: "푸시업" },
    { id: 2, name: "플랭크" },
    { id: 3, name: "스쿼트" },
  ];

  it("반환받는 배열 내부의 각 아이템의 exerciseOrder 는 startOrder + index 이다", () => {
    const startOrder = 1;
    const newDetails = getNewDetails(selectedExercises, {
      workoutId: 1,
      startOrder,
    });
    newDetails.map((detail, idx) => {
      expect(detail.exerciseOrder).toBe(startOrder + idx);
    });
  });
});

describe("convertLocalWorkoutDetailToServer", () => {
  it("should ", async () => {
    const localDetails: LocalWorkoutDetail[] = mockLocalWorkoutDetails
      .filter(
        (detail): detail is typeof detail & { id: number } =>
          detail.id !== undefined
      )
      .map((detail) => ({
        ...detail,
        workoutId: detail.id,
        exerciseId: detail.exerciseId - 100,
      }));

    const serverDetails = await convertLocalWorkoutDetailToServer(localDetails);

    serverDetails.forEach((converted, i) => {
      const {
        exerciseId: localExerciseId,
        workoutId: localWorkoutId,
        ...restLocalDetail
      } = localDetails[i];
      const {
        exerciseId: convertedExerciseId,
        workoutId: convertedworkoutId,
        ...restConvertedDetail
      } = converted;

      expect(convertedExerciseId).not.toBe(localExerciseId);

      expect(convertedworkoutId).not.toBe(localWorkoutId);

      // 그 외의 데이터는 변동이 없다
      expect({ ...restLocalDetail }).toMatchObject({ ...restConvertedDetail });
    });
  });
});

describe("convertServerWorkoutDetailToLocal", () => {
  const serverDetails = mockLocalWorkoutDetails;
  it("should ", async () => {
    const localDetails = await convertServerWorkoutDetailToLocal(
      mockLocalWorkoutDetails
    );
    serverDetails.forEach((converted, i) => {
      const {
        exerciseId: localExerciseId,
        workoutId: localWorkoutId,
        ...restLocalDetail
      } = localDetails[i];
      const {
        exerciseId: convertedExerciseId,
        workoutId: convertedworkoutId,
        ...restConvertedDetail
      } = converted;

      expect(convertedExerciseId).not.toBe(localExerciseId);
      expect(convertedworkoutId).not.toBe(localWorkoutId);
      // 그 외의 데이터는 변동이 없다
      expect({ ...restLocalDetail }).toMatchObject({ ...restConvertedDetail });
    });
  });
});
describe("getStartExerciseOrder", () => {
  it("상세 내역이 없으면 1을 반환한다", async () => {
    (db.workoutDetails.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        sortBy: jest.fn().mockResolvedValue([]),
      }),
    });
    const result = await getStartExerciseOrder(123);
    expect(result).toBe(1);
  });
  it("상세 내역이 있는경우 마지막 값(exerciseOrder) + 1 을 반환한다  ", async () => {
    (db.workoutDetails.where as jest.Mock).mockReturnValue({
      equals: jest.fn().mockReturnValue({
        sortBy: jest
          .fn()
          .mockResolvedValue([
            { exerciseOrder: 1 },
            { exerciseOrder: 2 },
            { exerciseOrder: 3 },
          ]),
      }),
    });
    const result = await getStartExerciseOrder(123);
    expect(result).toBe(4);
  });
});
