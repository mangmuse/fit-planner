import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import ExerciseList from "@/app/(main)/workout/exercises/_components/ExerciseList";
import { customRender } from "@/test-utils/test-utils";
import { LocalExercise } from "@/types/models";
import { screen } from "@testing-library/react";

describe("ExerciseList", () => {
  const renderList = (exercises: LocalExercise[]) => {
    const selectedExercises = [
      { id: 1, name: "벤치프레스" },
      { id: 2, name: "플랭크" },
    ];

    return customRender(
      <ExerciseList
        exercises={exercises}
        selectedExercises={selectedExercises}
        onAdd={jest.fn()}
        onDelete={jest.fn()}
        onReload={jest.fn()}
      />
    );
  };
  it("exercises 배열의 길이만큼 올바르게 ExerciseItem 컴포넌트를 렌더링한다", () => {
    const { getByText } = renderList(mockLocalExercises);
    mockLocalExercises.forEach((ex) => {
      const item = getByText(ex.name);
      expect(item).toBeInTheDocument();
    });
  });
  it("exercises 이 빈 배열인 경우 ExerciseItem 컴포넌트를 렌더링하지 않는다", () => {
    const { queryByRole } = renderList([]);
    expect(queryByRole("listitem")).not.toBeInTheDocument();
  });

  describe("snapshot", () => {
    it("렌더링 결과가 스냅샷과 일치하는지 확인한다", () => {
      const { asFragment } = renderList(mockLocalExercises);
      expect(asFragment()).toMatchSnapshot();
    });
    it("빈 exercises 배열일 때, 스냅샷 결과가 일치하는지 확인한다", () => {
      const { asFragment } = renderList([]);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
