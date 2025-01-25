import { exercises } from "@/__mocks__/api/handlers";
import { getAllExercises } from "@/api/exercise";

function getExpectedExercises(
  keyword: string,
  exerciseType: string,
  category: string
) {
  return exercises.filter((exercise) => {
    if (keyword && !exercise.name.includes(keyword)) {
      return false;
    }

    if (exerciseType !== "전체") {
      if (exerciseType === "커스텀" && !exercise.isCustom) {
        return false;
      }
      if (exerciseType === "즐겨찾기" && !exercise.isBookmarked) {
        return false;
      }
    }

    if (category !== "전체" && exercise.category !== category) {
      return false;
    }

    return true;
  });
}

describe("getAllExercises", () => {
  it("검색 키워드가 없고, 필터 요소가 모두 전체일 경우 모든 운동목록을 반환한다", async () => {
    const res = await getAllExercises("", "전체", "전체");
    expect(res).toEqual(getExpectedExercises("", "전체", "전체"));
  });

  it("검색 키워드가 있고, 필터 요소가 모두 전체일 경우 키워드가 포함된 모든 운동목록을 반환한다", async () => {
    const res = await getAllExercises("스쿼트", "전체", "전체");
    expect(res).toEqual(getExpectedExercises("스쿼트", "전체", "전체"));
  });

  it("검색 키워드가 없고 운동부위가 전체이며 ExerciseType이 커스텀일 경우 모든 커스텀 운동을 반환한다", async () => {
    const res = await getAllExercises("", "커스텀", "전체");
    expect(res).toEqual(getExpectedExercises("", "커스텀", "전체"));
  });

  it("검색 키워드가 없고 운동부위가 전체이며 ExerciseType이 즐겨찾기일 경우 모든 즐겨찾기 운동을 반환한다", async () => {
    const res = await getAllExercises("", "즐겨찾기", "전체");
    expect(res).toEqual(getExpectedExercises("", "즐겨찾기", "전체"));
  });

  it("검색 키워드가 없고 ExerciseType이 전체이며 운동 카테고리가 하체일 경우, 카테고리가 하체인 모든 운동 반환", async () => {
    const res = await getAllExercises("", "전체", "하체");
    expect(res).toEqual(getExpectedExercises("", "전체", "하체"));
  });

  it("검색 키워드가 있고, 필터 요소가 존재할 경우 키워드와 필터 조건에 맞는 운동목록을 반환한다", async () => {
    const res = await getAllExercises("데드", "즐겨찾기", "하체");
    expect(res).toEqual(getExpectedExercises("데드", "즐겨찾기", "하체"));
  });
});
