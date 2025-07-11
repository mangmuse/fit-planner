import {
  getPreferredWeightUnit,
  useWeightUnitPreference,
} from "@/hooks/useWeightUnitPreference";
import { act, renderHook } from "@testing-library/react";

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.removeItem.mockClear();
});

const WEIGHT_UNIT_KEY = "preferred_weight_unit";
describe("useWeightUnitPreference", () => {
  it("기본값은 kg이어야한다", () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useWeightUnitPreference());

    expect(result.current[0]).toBe("kg");
    expect(localStorageMock.getItem).toHaveBeenCalledWith(WEIGHT_UNIT_KEY);
  });

  it("localStorage에 저장된 값을 불러와야한다", () => {
    localStorageMock.getItem.mockReturnValue("lbs");

    const { result } = renderHook(() => useWeightUnitPreference());
    expect(result.current[0]).toBe("lbs");
    expect(localStorageMock.getItem).toHaveBeenCalledWith(WEIGHT_UNIT_KEY);
  });

  it("setPreferredUnit을 호출하면 단위가 변경되어야한다", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useWeightUnitPreference());
    const [unit, setPreferredUnit] = result.current;
    expect(unit).toBe("kg");

    act(() => {
      setPreferredUnit("lbs");
    });

    expect(result.current[0]).toBe("lbs");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      WEIGHT_UNIT_KEY,
      "lbs"
    );
  });
});

describe("getPreferredWeightUnit", () => {
  it("기본값은 kg이어야한다", () => {
    localStorageMock.getItem.mockReturnValue(null);
    const unit = getPreferredWeightUnit();
    expect(unit).toBe("kg");
    expect(localStorageMock.getItem).toHaveBeenCalledWith(WEIGHT_UNIT_KEY);
  });

  it("localStorage에 저장된 값을 불러와야한다", () => {
    localStorageMock.getItem.mockReturnValue("lbs");
    const unit = getPreferredWeightUnit();
    expect(unit).toBe("lbs");
    expect(localStorageMock.getItem).toHaveBeenCalledWith(WEIGHT_UNIT_KEY);
  });
});
