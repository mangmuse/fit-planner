import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import ExpandedSessionDetailsView from "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView";
import ExpandedSessionGroup from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import {
  SelectedGroupKey,
  useSelectedWorkoutGroups,
} from "@/store/useSelectedWorkoutGroups";
import { render, screen } from "@testing-library/react";

jest.mock("@/store/useSelectedWorkoutGroups");
jest.mock(
  "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup",
  () => {
    return jest.fn(({ sessionGroup, isSelected }) => {
      return (
        <div
          data-testid={`mock-expanded-group-${sessionGroup.exerciseOrder}`}
          data-is-selected={isSelected}
        >
          ExpandedSessionGroup
        </div>
      );
    });
  }
);

const mockSelectedWorkoutGroups = jest.mocked(useSelectedWorkoutGroups);
const mockExpandedSessionGroup = jest.mocked(ExpandedSessionGroup);

describe("ExpandedSessionDetailsView", () => {
  const mockToggleGroup = jest.fn();
  const mockDetails = [
    {
      ...mockWorkoutDetail.past,
      exerciseOrder: 1,
      exerciseName: "데드리프트",
      workoutId: 500,
    },
    {
      ...mockWorkoutDetail.past,
      exerciseName: "벤치프레스",
      exerciseOrder: 2,
      workoutId: 500,
    },
  ];
  const expectedGroups = getGroupedDetails(mockDetails);
  const selectedGroups: SelectedGroupKey[] = [
    {
      workoutId: 500,
      exerciseOrder: 2,
    },
  ];
  beforeEach(() => {
    jest.clearAllMocks();

    mockSelectedWorkoutGroups.mockReturnValue({
      selectedGroups: [],
      toggleGroup: mockToggleGroup,
    });
  });

  const renderExpandedSessionDetailsView = (
    workoutId?: number,
    groupedDetails = expectedGroups,
    isLoading = false
  ) => {
    render(
      <ExpandedSessionDetailsView 
        workoutId={workoutId || 500} 
        groupedDetails={groupedDetails}
        isLoading={isLoading}
      />
    );
  };
  it("가져온 데이터를 올바르게 그룹화하여 렌더링해야한다", () => {
    renderExpandedSessionDetailsView();

    expect(mockExpandedSessionGroup).toHaveBeenCalledTimes(2);

    const firstCall = mockExpandedSessionGroup.mock.calls[0][0];
    const secondCall = mockExpandedSessionGroup.mock.calls[1][0];

    expect(firstCall.sessionGroup.exerciseOrder).toBe(1);
    expect(secondCall.sessionGroup.exerciseOrder).toBe(2);

    expect(firstCall.sessionGroup).toEqual(expectedGroups[0]);
    expect(secondCall.sessionGroup).toEqual(expectedGroups[1]);
  });

  it("가져온 데이터가 없으면 렌더링하지 않아야한다", () => {
    renderExpandedSessionDetailsView(500, []);

    expect(mockExpandedSessionGroup).not.toHaveBeenCalled();
  });

  it("운동그룹중 selectedGroups에 포함된 그룹 컴포넌트에는 isSelected를 true로 전달해야한다", () => {
    mockSelectedWorkoutGroups.mockReturnValue({
      selectedGroups,
      toggleGroup: mockToggleGroup,
    });

    renderExpandedSessionDetailsView();

    expect(mockExpandedSessionGroup).toHaveBeenCalledTimes(2);

    const firstCall = mockExpandedSessionGroup.mock.calls[0][0];
    const secondCall = mockExpandedSessionGroup.mock.calls[1][0];

    expect(firstCall.isSelected).toBe(false);
    expect(secondCall.isSelected).toBe(true);
  });

  it("로딩 중일 때는 로딩 메시지를 표시해야한다", () => {
    renderExpandedSessionDetailsView(500, [], true);

    expect(
      screen.getByText("운동 정보를 불러오는 중...")
    ).toBeInTheDocument();

    // 로딩 중일 때는 그룹이 렌더링되지 않는다
    expect(mockExpandedSessionGroup).not.toHaveBeenCalled();
  });
});
