import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ExercisesContainer from "@/app/(main)/workout/exercises/_components/ExercisesContainer";
import { act } from "react";
import { customRender, screen } from "@/test-utils/test-utils";

describe("ExercisesContainer 통합 테스트", () => {
  const setup = () => {
    customRender(<ExercisesContainer />);
  };

  it("초기 로딩 시 전체 운동 목록을 렌더링한다.", async () => {
    setup();

    const squat = await screen.findByText("스쿼트");
    const bench = await screen.findByText("벤치프레스");
    const deadlift = await screen.findByText("데드리프트");
    const latPulldown = await screen.findByText("랫풀다운");
    expect(squat).toBeInTheDocument();
    expect(bench).toBeInTheDocument();
    expect(deadlift).toBeInTheDocument();
    expect(latPulldown).toBeInTheDocument();
  });

  it("검색어를 입력하면 검색어가 포함된 운동만 렌더링한다.", async () => {
    setup();

    const searchInput = screen.getByRole("textbox");
    await userEvent.type(searchInput, "데드리프트");

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1100)); //TODO: 가상 타이머를 사용시 에러가 나는 이유 찾기
    });

    const deadlift = await screen.findByText("데드리프트");
    expect(deadlift).toBeInTheDocument();

    expect(screen.queryByText("벤치프레스")).not.toBeInTheDocument();
    expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
  });

  it("ExerciseType이 '즐겨찾기'로 설정되면 즐겨찾기 운동만 렌더링한다.", async () => {
    setup();

    const favoriteBtn = screen.getByRole("button", { name: "즐겨찾기" });
    await userEvent.click(favoriteBtn);

    const bench = await screen.findByText("벤치프레스");
    const deadlift = screen.getByText("데드리프트");
    const latPullDown = screen.getByText("랫풀다운");

    expect(bench).toBeInTheDocument();
    expect(deadlift).toBeInTheDocument();
    expect(latPullDown).toBeInTheDocument();

    expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
  });
  it("운동 카테고리가 하체일 경우 운동부위가 하체인 운동만 렌더링한다 ", async () => {
    setup();
    const categoryBtn = screen.getByRole("button", { name: "하체" });
    await userEvent.click(categoryBtn);

    screen.debug();
    expect(screen.queryByText("스쿼트")).toBeInTheDocument();
    expect(screen.queryByText("데드리프트")).toBeInTheDocument();
    expect(screen.queryByText("벤치프레스")).not.toBeInTheDocument();
    expect(screen.queryByText("랫풀다운")).not.toBeInTheDocument();
  });
  it("운동 카테고리가 가슴일 경우 운동부위가 가슴인 운동만 렌더링한다 ", async () => {
    setup();
    const categoryBtn = screen.getByRole("button", { name: "가슴" });
    await userEvent.click(categoryBtn);

    screen.debug();
    expect(screen.queryByText("벤치프레스")).toBeInTheDocument();
    expect(screen.queryByText("데드리프트")).not.toBeInTheDocument();
    expect(screen.queryByText("랫풀다운")).not.toBeInTheDocument();
    expect(screen.queryByText("스쿼트")).not.toBeInTheDocument();
  });
});
// TODO: 북마크 및 운동선택 테스트 추가
