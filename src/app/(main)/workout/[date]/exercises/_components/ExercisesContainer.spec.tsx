jest.mock("next/navigation");
import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { CATEGORYLIST, EXERCISETYPELIST } from "@/constants/filters";
import { db } from "@/lib/db";
import { customRender, render, waitFor, within } from "@/test-utils/test-utils";

describe("ExercisesContainer", () => {
  beforeEach(() => {
    jest.spyOn(db.exercises, "toArray").mockResolvedValue(mockLocalExercises);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderExercisesContainer = () => {
    return customRender(<ExercisesContainer />);
  };

  describe("초기 렌더링", () => {
    it("SearchBar를 올바르게 렌더링하며 초기값은 빈 문자열이다", async () => {
      const { getByRole } = renderExercisesContainer();
      await waitFor(() => {
        const searchInput = getByRole("textbox") as HTMLInputElement;
        expect(searchInput).toBeInTheDocument();

        expect(searchInput.value).toBe("");
      });
    });

    describe("ExerciseFilter가 올바르게 렌더링된다", () => {
      it("TypeFilter 가 올바르게 렌더링된다", async () => {
        const { getAllByText } = renderExercisesContainer();
        await waitFor(() => {
          EXERCISETYPELIST.forEach((type) => {
            const elements = getAllByText(type);
            expect(elements.length).toBeGreaterThan(0);
          });
        });
      });

      it("초기 상태에서 TypeFilter의 '전체' 버튼의 배경색은 bg-primary 이다", async () => {
        const { getByTestId } = renderExercisesContainer();
        await waitFor(() => {
          const typeFilterNav = getByTestId("type-filter");

          const entire = within(typeFilterNav).getByText("전체");
          expect(entire).toHaveClass("bg-primary");
        });
      });

      it("CategoryFilter 가 올바르게 렌더링된다", async () => {
        const { getAllByText } = renderExercisesContainer();
        await waitFor(() => {
          CATEGORYLIST.forEach((type) => {
            const elements = getAllByText(type);
            expect(elements.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it("초기 상태에서 CategoryFilter의 '전체' 버튼의 배경색은 bg-primary 이다", async () => {
      const { getByTestId } = renderExercisesContainer();
      await waitFor(() => {
        const categoryFilterNav = getByTestId("category-filter");

        const entire = within(categoryFilterNav).getByText("전체");
        expect(entire).toHaveClass("bg-primary");
      });
    });

    describe("첫 렌더링시 DB에서 가져온 exercises 데이터를 화면에 렌더링한다", () => {
      it("DB의 데이터만큼 아이템을 올바르게 렌더링한다", async () => {
        const { getByText } = renderExercisesContainer();

        await waitFor(() => {
          mockLocalExercises.forEach((ex) => {
            const item = getByText(ex.name);
            expect(item).toBeInTheDocument();
          });
        });
      });

      it("isBookmarked가 true이면 꽉찬 별 아이콘이 렌더링된다", async () => {
        const bookmarked = { id: 1, name: "벤치프레스", isBookmarked: true };
        jest.spyOn(db.exercises, "toArray").mockResolvedValue([bookmarked]);
        const { getByAltText } = renderExercisesContainer();

        await waitFor(() => {
          const icon = getByAltText("북마크 해제");
          expect(icon).toBeInTheDocument();
        });
      });

      it("isBookmarked가 false이면 빈 별 아이콘이 렌더링된다", async () => {
        const bookmarked = { id: 1, name: "벤치프레스", isBookmarked: false };
        jest.spyOn(db.exercises, "toArray").mockResolvedValue([bookmarked]);
        const { getByAltText } = renderExercisesContainer();

        await waitFor(() => {
          const icon = getByAltText("북마크");
          expect(icon).toBeInTheDocument();
        });
      });
    });
  });
});
