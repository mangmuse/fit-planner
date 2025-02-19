import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { db } from "@/lib/db";
import { customRender } from "@/test-utils/test-utils";

describe("ExercisesContainer", () => {
  jest.spyOn(db.exercises, "toArray").mockResolvedValue(mockLocalExercises);

  const { getByText, getByRole } = customRender(<ExercisesContainer />);
});
