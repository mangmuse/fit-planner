import { RPESelectorProps } from "@/app/(main)/workout/_components/RPESelector";
import { SetTypeSelectorProps } from "@/app/(main)/workout/_components/SetTypeSelector";

const childPropsSpySetType = jest.fn();
const childPropsSpyRPE = jest.fn();

jest.mock("@/app/(main)/workout/_components/SetTypeSelector", () => {
  const MockSetTypeSelector = (props: SetTypeSelectorProps) => {
    childPropsSpySetType(props);
    return <div data-testid="settype-selector" />;
  };
  MockSetTypeSelector.displayName = "MockSetTypeSelector";
  return MockSetTypeSelector;
});

// RPESelector 목 컴포넌트 정의 (displayName 명시)
jest.mock("@/app/(main)/workout/_components/RPESelector", () => {
  const MockRPESelector = (props: RPESelectorProps) => {
    childPropsSpyRPE(props);
    return <div data-testid="rpe-selector" />;
  };
  MockRPESelector.displayName = "MockRPESelector";
  return MockRPESelector;
});

describe("SetOptionSheet", () => {
  //   it("SetTypeSelector 컴포넌트에 올바른 props를 전달한다", () => {});
  //   it("RPESelector 컴포넌트에 올바른 props를 전달한다", () => {});
});
