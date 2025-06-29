import { getFilteredExercises } from "./getFilteredExercises";
import { mockExercise } from "@/__mocks__/exercise.mock";

const mockExercises = [
  {
    ...mockExercise.bookmarked,
    id: 1,
    serverId: 100,
    name: "벤치프레스",
    category: "가슴",
    isCustom: false,
    isBookmarked: false,
  },
  {
    ...mockExercise.bookmarked,
    id: 2,
    serverId: 200,
    name: "인클라인 벤치프레스",
    category: "가슴",
    isCustom: true,
    isBookmarked: false,
  },
  {
    ...mockExercise.bookmarked,
    id: 3,
    serverId: 300,
    name: "스쿼트",
    category: "하체",
    isCustom: false,
    isBookmarked: true,
  },
  {
    ...mockExercise.bookmarked,
    id: 4,
    serverId: 400,
    name: "커스텀 스쿼트",
    category: "하체",
    isCustom: true,
    isBookmarked: true,
  },
];

describe("getFilteredExercises with Snapshots", () => {
  it("키워드가 포함된 운동만 반환해야 한다", () => {
    const result = getFilteredExercises(
      mockExercises,
      "프레스",
      "전체",
      "전체"
    );
    // result 배열 전체의 '스냅샷'을 찍어 비교합니다.
    expect(result).toMatchSnapshot();
  });

  it('exerciseType이 "커스텀"일 때, isCustom이 true인 운동만 반환해야 한다', () => {
    const result = getFilteredExercises(mockExercises, "", "커스텀", "전체");
    expect(result).toMatchSnapshot();
  });

  it("여러 필터가 조합되었을 때, 모든 조건을 만족하는 운동만 반환해야 한다", () => {
    const result = getFilteredExercises(
      mockExercises,
      "스쿼트",
      "커스텀",
      "하체"
    );

    expect(result).toMatchSnapshot();
  });

  it("필터 조건을 만족하는 운동이 없으면, 빈 배열을 반환해야 한다", () => {
    const result = getFilteredExercises(
      mockExercises,
      "이런운동은없다",
      "전체",
      "전체"
    );

    // 빈 배열을 반환해야 한다
    expect(result).toMatchSnapshot();
  });

  it('exerciseType이 "즐겨찾기"일 때, isBookmarked가 true인 운동만 반환해야 한다', () => {
    const result = getFilteredExercises(mockExercises, "", "즐겨찾기", "전체");

    expect(result).toMatchSnapshot();

    expect(result.length).toBe(2);
    expect(result.map((e) => e.name)).toEqual(["스쿼트", "커스텀 스쿼트"]);
  });
});
