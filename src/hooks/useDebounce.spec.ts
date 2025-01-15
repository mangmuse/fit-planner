import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  jest.useFakeTimers();

  it("delay 이후에 value가 업데이트된다", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "test", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    expect(result.current).toBe("test");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("컴포넌트가 언마운트 된 경우 debounce를 취소한다", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { result, unmount } = renderHook(() => useDebounce("test", 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
