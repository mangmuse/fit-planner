import {
  formatWeight,
  parseWeightInput,
  convertKgtoLbs,
  convertLbstoKg,
} from "./weightConversion";

describe("weightConversion", () => {
  describe("formatWeight", () => {
    it("kg 단위일 때 정수는 소수점 없이 표시한다", () => {
      expect(formatWeight(150, "kg")).toBe("150 kg");
    });

    it("kg 단위일 때 소수점이 있으면 최대 2자리까지 표시한다", () => {
      expect(formatWeight(150.25, "kg")).toBe("150.25 kg");
      expect(formatWeight(150.2, "kg")).toBe("150.2 kg");
      expect(formatWeight(150.2, "kg")).toBe("150.2 kg");
    });

    it("lbs 단위일 때는 정수로 표시한다", () => {
      expect(formatWeight(150, "lbs")).toBe("150 lbs");
      expect(formatWeight(150.7, "lbs")).toBe("151 lbs");
    });
  });

  describe("parseWeightInput", () => {
    describe("kg 단위", () => {
      it("빈 문자열이면 null을 반환한다", () => {
        expect(parseWeightInput("", "kg")).toBeNull();
        expect(parseWeightInput("   ", "kg")).toBeNull();
      });

      it("정수를 올바르게 파싱한다", () => {
        expect(parseWeightInput("150", "kg")).toBe(150);
      });

      it("소수점을 올바르게 파싱한다", () => {
        expect(parseWeightInput("150.25", "kg")).toBe(150.25);
        expect(parseWeightInput("150.2", "kg")).toBe(150.2);
      });

      it("소수점 2자리까지만 허용한다", () => {
        expect(parseWeightInput("150.256", "kg")).toBe(150.26);
      });

      it("음수는 null을 반환한다", () => {
        expect(parseWeightInput("-150", "kg")).toBeNull();
      });

      it("숫자가 아닌 문자는 제거한다", () => {
        expect(parseWeightInput("150abc", "kg")).toBe(150);
        expect(parseWeightInput("abc150.25def", "kg")).toBe(150.25);
      });

      it("여러 소수점이 있으면 첫 번째만 유지한다", () => {
        expect(parseWeightInput("150.25.30", "kg")).toBe(150.25);
      });
    });

    describe("lbs 단위", () => {
      it("정수만 허용한다", () => {
        expect(parseWeightInput("150", "lbs")).toBe(150);
        expect(parseWeightInput("150.7", "lbs")).toBe(150);
      });

      it("음수는 null을 반환한다", () => {
        expect(parseWeightInput("-150", "lbs")).toBeNull();
      });

      it("숫자가 아닌 문자는 제거한다", () => {
        expect(parseWeightInput("150abc", "lbs")).toBe(150);
      });
    });
  });

  describe("convertKgtoLbs", () => {
    it("kg을 lbs로 변환한다", () => {
      expect(convertKgtoLbs(100)).toBeCloseTo(220.5);
    });
  });

  describe("convertLbstoKg", () => {
    it("lbs를 kg로 변환한다", () => {
      expect(convertLbstoKg(220.5)).toBeCloseTo(100);
    });
  });
});
