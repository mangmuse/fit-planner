jest.mock("next/navigation");
jest.mock("next-auth/react");
jest.mock("@/services/exercise.service", () => {
  const originalModule = jest.requireActual("@/services/exercise.service");
  return {
    ...originalModule,
    toggleLocalBookmark: jest.fn((...args) => {
      return originalModule.toggleLocalBookmark(...args);
    }),
    getAllLocalExercises: jest.fn((...args) => {
      return originalModule.getAllLocalExercises(...args);
    }),
  };
});

import { mockLocalExercises } from "@/__mocks__/exercise.mock";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { CATEGORYLIST, EXERCISETYPELIST } from "@/constants/filters";
import { db } from "@/lib/db";
import {
  getAllLocalExercises,
  toggleLocalBookmark,
} from "@/services/exercise.service";
import {
  customRender,
  getByRole,
  screen,
  waitFor,
  within,
} from "@/test-utils/test-utils";
import { Category, ExerciseType } from "@/types/filters";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";

describe("ExercisesContainer", () => {
  const mockSession = {
    user: {
      id: "mockUserId",
      name: "Test User",
      email: "test@example.com",
    },
    expires: "some-future-date",
  };
  const mockExercises = [
    ...mockLocalExercises,
    {
      category: "등",
      createdAt: "2023-01-03T00:00:00Z",
      id: 5,
      imageUrl: "https://example.com/push-up.png",
      isBookmarked: true,
      isCustom: true,
      isSynced: true,
      name: "나만의 운동",
      serverId: null,
      updatedAt: null,
      userId: null,
    },
  ];
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: "authenticated",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderExercisesContainer = () => {
    return customRender(<ExercisesContainer />);
  };

  describe("초기 렌더링", () => {
    beforeEach(() => {
      jest.restoreAllMocks();

      jest.spyOn(db.exercises, "toArray").mockResolvedValueOnce(mockExercises);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
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
        jest
          .spyOn(db.exercises, "toArray")
          .mockResolvedValueOnce(mockExercises);
        const { getByText } = renderExercisesContainer();
        await waitFor(() => {
          mockExercises.forEach((ex) => {
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

  describe("SearchBar와 ExerciseFilter에 따라 다른 exercises를 렌더링한다", () => {
    const setFilter = async (
      typeFilterValue: ExerciseType,
      categoryFilterValue: Category
    ) => {
      const typeFilterNav = screen.getByTestId("type-filter");
      await userEvent.click(within(typeFilterNav).getByText(typeFilterValue));
      const categoryFilterNav = screen.getByTestId("category-filter");
      await userEvent.click(
        within(categoryFilterNav).getByText(categoryFilterValue)
      );
    };
    beforeEach(() => {
      jest.spyOn(db.exercises, "toArray").mockResolvedValue(mockExercises);
    });
    describe("검색어 x", () => {
      const cases = [
        {
          type: "전체",
          category: "전체",
          expected: mockExercises,
          desc: "5개의 모든 운동",
        },
        {
          type: "전체",
          category: "가슴",
          expected: mockExercises.filter((ex) => ex.category === "가슴"),
          desc: "가슴운동 1개",
        },
        {
          type: "전체",
          category: "하체",
          expected: mockExercises.filter((ex) => ex.category === "하체"),
          desc: "하체운동 1개",
        },
        {
          type: "커스텀",
          category: "전체",
          expected: mockExercises.filter((ex) => ex.isCustom),
          desc: "나만의 운동 1개",
        },
        {
          type: "커스텀",
          category: "등",
          expected: mockExercises.filter(
            (ex) => ex.isCustom && ex.category === "등"
          ),
          desc: "나만의 운동 1개",
        },
        {
          type: "커스텀",
          category: "가슴",
          expected: [],
          desc: "리스트가 렌더링되지 않음",
        },
        {
          type: "즐겨찾기",
          category: "전체",
          expected: mockExercises.filter((ex) => ex.isBookmarked),
          desc: "북마크 4개",
        },
        {
          type: "즐겨찾기",
          category: "하체",
          expected: mockExercises.filter(
            (ex) => ex.isBookmarked && ex.category === "하체"
          ),
          desc: "북마크한 하체운동 1개",
        },
        {
          type: "즐겨찾기",
          category: "가슴",
          expected: mockExercises.filter(
            (ex) => ex.isBookmarked && ex.category === "가슴"
          ),
          desc: "북마크한 가슴운동 1개",
        },
      ];

      it.each(cases)(
        "검색어='', TypeFilter=$type, CategoryFilter=$category",
        async ({ type, category, expected }) => {
          renderExercisesContainer();

          setFilter(type as ExerciseType, category as Category);

          await waitFor(() => {
            if (expected.length === 0) {
              const list = screen.queryByRole("list");
              expect(list).not.toBeInTheDocument();
            } else {
              expected.forEach((ex) => {
                expect(screen.getByText(ex.name)).toBeInTheDocument();
              });
            }
          });
        }
      );
    });

    describe("검색어 o", () => {
      it("검색어='벤치', TypeFilter='전체', CategoryFilter='전체'", async () => {
        renderExercisesContainer();

        const input = await screen.findByRole("textbox");
        await userEvent.type(input, "벤치");
        setFilter("전체", "전체");
        await waitFor(() => {
          expect(screen.getByText("벤치프레스")).toBeInTheDocument();
        });
      });
      it("검색어='벤치', TypeFilter='전체', CategoryFilter='등'", async () => {
        renderExercisesContainer();
        const input = screen.getByRole("textbox");

        setFilter("전체", "등");

        await userEvent.type(input, "벤치");

        await waitFor(() => {
          const list = screen.queryByRole("list");
          expect(list).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("북마크 상호작용", () => {
    const mockExercise = {
      category: "등",
      createdAt: "2023-01-03T00:00:00Z",
      id: 1,
      imageUrl: "https://example.com/push-up.png",
      isBookmarked: false,
      isCustom: true,
      isSynced: true,
      name: "나만의 운동",
      serverId: null,
      updatedAt: null,
      userId: null,
    };

    beforeEach(async () => {
      await db.exercises.clear();
      jest.restoreAllMocks();
      jest.spyOn(db.exercises, "update");
    });

    afterEach(async () => {
      await db.exercises.clear();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("북마크 상태가 아닌 아이템의 북마크 아이콘 클릭시 toggleLocalBookmark와 update가 호출된다 ", async () => {
      jest
        .spyOn(db.exercises, "toArray")
        .mockResolvedValueOnce([mockExercise])
        .mockResolvedValueOnce([mockExercise]);

      renderExercisesContainer();
      const bookmarkBtn = await screen.findByRole("button", {
        name: "북마크",
      });
      await userEvent.click(bookmarkBtn);

      await waitFor(() => {
        expect(toggleLocalBookmark).toHaveBeenCalledWith(1, true);
        expect(db.exercises.update).toHaveBeenCalledWith(1, {
          isBookmarked: true,
          isSynced: false,
          updatedAt: expect.any(String),
        });
      });
    });

    it("북마크 상태가 아닌 아이템의 북마크 아이콘 클릭시 isBookmarked 상태가 true가 되며 북마크 아이콘이 표시된다", async () => {
      jest
        .spyOn(db.exercises, "toArray")
        .mockResolvedValueOnce([mockExercise])
        .mockResolvedValueOnce([mockExercise])
        .mockResolvedValueOnce([{ ...mockExercise, isBookmarked: true }]);

      renderExercisesContainer();
      const bookmarkBtn = await screen.findByRole("button", {
        name: "북마크",
      });
      await userEvent.click(bookmarkBtn);

      const newBtn = await screen.findByRole("button", {
        name: "북마크 해제",
      });
      expect(newBtn).toBeInTheDocument();
    });

    describe("북마크 해제", () => {
      const clickBookmarkBtn = async () => {
        jest
          .spyOn(db.exercises, "toArray")
          .mockResolvedValueOnce([{ ...mockExercise, isBookmarked: true }])
          .mockResolvedValueOnce([{ ...mockExercise, isBookmarked: true }]);
        renderExercisesContainer();
        const bookmarkBtn = await screen.findByRole("button", {
          name: "북마크 해제",
        });
        await userEvent.click(bookmarkBtn);
      };
      it("북마크 상태인 아이템의 북마크 아이콘 클릭시 모달이 호출된다", async () => {
        await clickBookmarkBtn();
        const modal = await screen.findByRole("dialog");
        expect(modal).toBeInTheDocument();
      });
      it("모달의 취소 버튼 클릭 시 모달이 닫히며 다른 이벤트가 일어나지 않는다", async () => {
        await clickBookmarkBtn();
        jest
          .spyOn(db.exercises, "toArray")
          .mockResolvedValueOnce([{ ...mockExercise, isBookmarked: true }]);

        const cancelBtn = await screen.findByRole("button", { name: "취소" });
        expect(cancelBtn).toBeInTheDocument();
        await userEvent.click(cancelBtn);

        const modal = screen.queryByRole("dialog");
        expect(modal).not.toBeInTheDocument();

        const bookmarkBtn = await screen.findByRole("button", {
          name: "북마크 해제",
        });
        expect(bookmarkBtn).toBeInTheDocument();
      });
      it("모달의 확인 버튼 클릭 시 isBookmarked의 상태가 false가 되며 북마크 해제 아이콘이 표시된다", async () => {
        await clickBookmarkBtn();
        jest
          .spyOn(db.exercises, "toArray")
          .mockResolvedValueOnce([{ ...mockExercise, isBookmarked: false }]);
        const confirmBtn = await screen.findByRole("button", { name: "확인" });
        await userEvent.click(confirmBtn);

        const modal = screen.queryByRole("dialog");
        expect(modal).not.toBeInTheDocument();
        const bookmarkBtn = await screen.findByRole("button", {
          name: "북마크",
        });
        expect(bookmarkBtn).toBeInTheDocument();
      });
    });
  });
});
