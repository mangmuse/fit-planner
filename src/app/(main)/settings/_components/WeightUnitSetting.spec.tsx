import { WeightUnitSetting } from "@/app/(main)/settings/_components/WeightUnitSetting";
import { useWeightUnitPreference } from "@/hooks/useWeightUnitPreference";
import { act, render, screen } from "@testing-library/react";

jest.mock("@/hooks/useWeightUnitPreference");

const mockUseWeightUnitPreference = jest.mocked(useWeightUnitPreference);

describe("WeightUnitSetting", () => {
  const mockSetPreferredUnit = jest.fn();
  describe("렌더링", () => {
    it("useWeightUnitPreference에서 불러온 기본 단위를 포함해 올바르게 렌더링 되어야한다 ", () => {
      mockUseWeightUnitPreference.mockReturnValue(["kg", mockSetPreferredUnit]);
      render(<WeightUnitSetting />);
      expect(mockUseWeightUnitPreference).toHaveBeenCalled();

      expect(screen.getByText("기본 무게 단위")).toBeInTheDocument();
      expect(screen.getByLabelText("현재 무게 단위: kg")).toBeInTheDocument();

      expect(screen.getByLabelText("kg 단위 선택")).toBeInTheDocument();
      expect(screen.getByLabelText("lbs 단위 선택")).toBeInTheDocument();
    });
  });
  describe("상호작용", () => {
    it("무게 단위 선택 버튼을 클릭하면 단위가 변경되어야한다(setPreferredUnit 호출)", () => {
      mockUseWeightUnitPreference.mockReturnValue(["kg", mockSetPreferredUnit]);
      render(<WeightUnitSetting />);
      expect(mockUseWeightUnitPreference).toHaveBeenCalled();

      expect(screen.getByLabelText("현재 무게 단위: kg")).toBeInTheDocument();

      const button = screen.getByLabelText("lbs 단위 선택");
      expect(button).toBeInTheDocument();

      act(() => {
        button.click();
      });

      expect(mockSetPreferredUnit).toHaveBeenCalledWith("lbs");
    });
  });
});
