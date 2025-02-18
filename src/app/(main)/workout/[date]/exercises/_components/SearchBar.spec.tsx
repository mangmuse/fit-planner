import SearchBar from "@/app/(main)/workout/[date]/exercises/_components/SearchBar";
import { customRender } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("SearchBar", () => {
  const renderSearchBar = (keyword: string = "") => {
    const onChangeMock = jest.fn();

    const utils = customRender(
      <SearchBar keyword={keyword} onChange={onChangeMock} />
    );
    return { ...utils, onChangeMock };
  };

  it("keyword 가 input의 value로 렌더링된다", () => {
    const { getByRole } = renderSearchBar("dog");
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("dog");
  });
  it("input element에 타이핑을 할 경우 onChange가 호출된다", async () => {
    const { getByRole, onChangeMock } = renderSearchBar("");
    const input = getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");

    await userEvent.type(input, "dog");
    expect(onChangeMock).toHaveBeenCalledTimes(3);
  });
});
