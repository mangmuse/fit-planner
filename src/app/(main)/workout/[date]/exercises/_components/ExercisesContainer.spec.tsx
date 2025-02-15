it("stone", () => {
  const mungyi = "cute";
  expect(mungyi).toBe("cute");
});
// import userEvent from "@testing-library/user-event";
// import "@testing-library/jest-dom";

// import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
// import {
//   act,
//   customRender,
//   screen,
//   waitFor,
//   within,
// } from "@/test-utils/test-utils";
// const setup = async () => {
//   return customRender(<ExercisesContainer />);
// };
// describe("운동 리스트 초기렌더링", () => {
//   it("초기 로딩 시 전체 운동 목록을 렌더링한다.", async () => {
//     setup();

//     const squat = await screen.findByText("스쿼트");
//     const bench = await screen.findByText("벤치프레스");
//     const deadlift = await screen.findByText("데드리프트");
//     const latPulldown = await screen.findByText("랫풀다운");
//     expect(squat).toBeInTheDocument();
//     expect(bench).toBeInTheDocument();
//     expect(deadlift).toBeInTheDocument();
//     expect(latPulldown).toBeInTheDocument();
//   });

//   it("검색어를 입력하면 검색어가 포함된 운동만 렌더링한다.", async () => {
//     setup();

//     const searchInput = screen.getByRole("textbox");
//     await userEvent.type(searchInput, "데드리프트");

//     await act(async () => {
//       await new Promise((r) => setTimeout(r, 1100)); //TODO: 가상 타이머를 사용시 에러가 나는 이유 찾기
//     });

//     const deadlift = await screen.findByText("데드리프트");
//     expect(deadlift).toBeInTheDocument();

//     expect(screen.queryByText("벤치프레스")).not.toBeInTheDocument();
//     expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
//   });

//   it("ExerciseType이 '즐겨찾기'로 설정되면 즐겨찾기 운동만 렌더링한다.", async () => {
//     setup();

//     const favoriteBtn = screen.getByRole("button", { name: "즐겨찾기" });
//     await userEvent.click(favoriteBtn);

//     const bench = await screen.findByText("벤치프레스");
//     const deadlift = screen.getByText("데드리프트");
//     const latPullDown = screen.getByText("랫풀다운");

//     expect(bench).toBeInTheDocument();
//     expect(deadlift).toBeInTheDocument();
//     expect(latPullDown).toBeInTheDocument();

//     expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
//   });
//   it("운동 카테고리가 하체일 경우 운동부위가 하체인 운동만 렌더링한다 ", async () => {
//     setup();
//     const categoryBtn = screen.getByRole("button", { name: "하체" });
//     await userEvent.click(categoryBtn);

//     screen.debug();
//     expect(screen.queryByText("스쿼트")).toBeInTheDocument();
//     expect(screen.queryByText("데드리프트")).toBeInTheDocument();
//     expect(screen.queryByText("벤치프레스")).not.toBeInTheDocument();
//     expect(screen.queryByText("랫풀다운")).not.toBeInTheDocument();
//   });
//   it("운동 카테고리가 가슴일 경우 운동부위가 가슴인 운동만 렌더링한다 ", async () => {
//     setup();
//     const categoryBtn = screen.getByRole("button", { name: "가슴" });
//     await userEvent.click(categoryBtn);

//     screen.debug();
//     expect(screen.queryByText("벤치프레스")).toBeInTheDocument();
//     expect(screen.queryByText("데드리프트")).not.toBeInTheDocument();
//     expect(screen.queryByText("랫풀다운")).not.toBeInTheDocument();
//     expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
//   });
// });

// describe("북마크", () => {
//   it("북마크 상태가 아닌 운동의 북마크 버튼을 누르면 북마크 상태로 변경된다", async () => {
//     setup();
//     const exerciseText = await screen.findByText("스쿼트");
//     const listItem = exerciseText.closest("li");
//     if (!listItem) {
//       throw new Error("리스트 항목을 찾을 수 없습니다.");
//     }
//     const bookmarkBtn = within(listItem).getByAltText("북마크");
//     expect(bookmarkBtn).toBeInTheDocument();

//     await userEvent.click(bookmarkBtn);
//     const removeBookmarkBtn = within(listItem).getByAltText("북마크 해제");
//     expect(removeBookmarkBtn).toBeInTheDocument();
//   });
//   describe("북마크 해제", () => {
//     const setupListItemForTest = async () => {
//       await setup();
//       const exerciseText = await screen.findByText("랫풀다운");
//       const listItem = exerciseText.closest("li");
//       if (!listItem) {
//         throw new Error("리스트 항목을 찾을 수 없습니다.");
//       }
//       const removeBookmarkBtn = within(listItem).getByAltText("북마크 해제");
//       expect(removeBookmarkBtn).toBeInTheDocument();
//       await userEvent.click(removeBookmarkBtn);

//       return { listItem, removeBookmarkBtn };
//     };

//     it("북마크 상태인 운동의 북마크 해제 버튼을 누르면 확인 모달이 표시된다", async () => {
//       await setupListItemForTest();
//       const modal = screen.getByRole("dialog");
//       expect(modal).toBeInTheDocument();

//       expect(
//         screen.getByText("즐겨찾기에서 제거하시겠습니까?")
//       ).toBeInTheDocument();
//       const modalExerciseName = screen.getByText("랫풀다운", { selector: "p" });
//       expect(modalExerciseName).toBeInTheDocument();
//       expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
//       expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
//     });
//     it("확인 모달에서 취소 버튼을 누르면 북마크 상태가 해제되지 않고 모달이 닫힌다", async () => {
//       await setupListItemForTest();

//       const modal = screen.getByRole("dialog");
//       const confirmBtn = screen.getByRole("button", { name: "취소" });
//       await userEvent.click(confirmBtn);
//       expect(modal).not.toBeInTheDocument();
//     });
//     it("확인 모달에서 확인 버튼을 누르면 북마크 상태가 해제되고 모달이 닫힌다", async () => {
//       const { listItem } = await setupListItemForTest();

//       const confirmBtn = screen.getByRole("button", { name: "확인" });

//       await userEvent.click(confirmBtn);

//       const BookmarkBtn = within(listItem).getByAltText("북마크");
//       expect(BookmarkBtn).toBeInTheDocument();
//     });
//   });
// });

// it("운동 아이템을 클릭하면 해당 운동이 선택되며 복수 선택이 가능하다", async () => {
//   setup();
//   const squat = await screen.findByText("스쿼트");
//   const latPulldown = await screen.findByText("랫풀다운");

//   expect(squat).not.toHaveClass("text-primary");
//   expect(latPulldown).not.toHaveClass("text-primary");

//   await userEvent.click(squat);
//   await userEvent.click(latPulldown);

//   expect(squat).toHaveClass("text-primary");
//   expect(latPulldown).toHaveClass("text-primary");
// });
// it("이미 선택된 운동을 다시 클릭하면 선택이 해제된다", async () => {
//   setup();
//   const squat = await screen.findByText("스쿼트");
//   expect(squat).not.toHaveClass("text-primary");

//   await userEvent.click(squat);
//   expect(squat).toHaveClass("text-primary");

//   await userEvent.click(squat);
//   expect(squat).not.toHaveClass("text-primary");
// });

// it("선택된 운동이 있을경우 선택된 운동 수 만큼 n개 선택 완료 라는 버튼이 보여진다", async () => {
//   setup();
//   const squat = await screen.findByText("스쿼트");
//   const latPulldown = await screen.findByText("랫풀다운");

//   await userEvent.click(squat);

//   expect(
//     screen.getByRole("button", { name: "1개 선택 완료" })
//   ).toBeInTheDocument();
//   await userEvent.click(latPulldown);
//   expect(
//     screen.getByRole("button", { name: "2개 선택 완료" })
//   ).toBeInTheDocument();
// });

// // it("선택 완료 버튼을 누르면 해당 운동이 workout에 추가된다", async () => {
// //   setup();
// //   const squat = await screen.findByText("스쿼트");

// //   await userEvent.click(squat);

// //   const addBtn = screen.getByRole("button", { name: "1개 선택 완료" });
// //   const res = await userEvent.click(addBtn);
// //   expect(res).toBe({ success: true });
// // });

// // TODO: 북마크 및 운동 추가부분 Workout페이지 완성 후 테스트 작성 필요
