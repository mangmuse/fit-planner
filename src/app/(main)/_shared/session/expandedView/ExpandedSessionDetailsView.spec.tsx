import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import ExpandedSessionDetailsView from "@/app/(main)/_shared/session/expandedView/ExpandedSessionDetailsView";
import ExpandedSessionGroup from "@/app/(main)/_shared/session/expandedView/ExpandedSessionGroup";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { workoutDetailService } from "@/lib/di";
import {
  SelectedGroupKey,
  useSelectedWorkoutGroups,
} from "@/store/useSelectedWorkoutGroups";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/di");
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

const mockDeteailService = jest.mocked(workoutDetailService);
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

  const renderExpandedSessionDetailsView = (workoutId?: number) => {
    render(<ExpandedSessionDetailsView workoutId={workoutId || 500} />);
  };
  it("가져온 데이터를 올바르게 그룹화하여 렌더링해야한다", async () => {
    mockDeteailService.getLocalWorkoutDetailsByWorkoutId.mockResolvedValue(
      mockDetails
    );

    renderExpandedSessionDetailsView();

    await waitFor(() => {
      expect(mockExpandedSessionGroup).toHaveBeenCalledTimes(2);

      const firstCall = mockExpandedSessionGroup.mock.calls[0][0];
      const secondCall = mockExpandedSessionGroup.mock.calls[1][0];

      expect(firstCall.sessionGroup.exerciseOrder).toBe(1);
      expect(secondCall.sessionGroup.exerciseOrder).toBe(2);

      expect(firstCall.sessionGroup).toEqual(expectedGroups[0]);
      expect(secondCall.sessionGroup).toEqual(expectedGroups[1]);
    });
  });

  it("가져온 데이터가 없으면 렌더링하지 않아야한다", async () => {
    mockDeteailService.getLocalWorkoutDetailsByWorkoutId.mockResolvedValue([]);

    renderExpandedSessionDetailsView();

    await waitFor(() => {
      expect(mockExpandedSessionGroup).not.toHaveBeenCalled();
    });
  });

  it("운동그룹중 selectedGroups에 포함된 그룹 컴포넌트에는 isSelected를 true로 전달해야한다", async () => {
    mockDeteailService.getLocalWorkoutDetailsByWorkoutId.mockResolvedValue(
      mockDetails
    );

    mockSelectedWorkoutGroups.mockReturnValue({
      selectedGroups,
      toggleGroup: mockToggleGroup,
    });

    renderExpandedSessionDetailsView();

    await waitFor(() => {
      expect(mockExpandedSessionGroup).toHaveBeenCalledTimes(2);

      const firstCall = mockExpandedSessionGroup.mock.calls[0][0];
      const secondCall = mockExpandedSessionGroup.mock.calls[1][0];

      expect(firstCall.isSelected).toBe(false);
      expect(secondCall.isSelected).toBe(true);
    });
  });

  it("세션을 불러오는 도중 에러가 발생하면 에러 메시지를 렌더링해야한다", async () => {
    const mockError = new Error("조회 실패");
    mockDeteailService.getLocalWorkoutDetailsByWorkoutId.mockRejectedValue(
      mockError
    );

    renderExpandedSessionDetailsView();

    await waitFor(() => {
      expect(
        screen.getByText("운동 상세 정보를 불러오는 중 오류가 발생했습니다")
      ).toBeInTheDocument();
    });

    // 에러 발생 시 그룹은 렌더링되지 않는다
    const group = screen.queryByTestId("mock-expanded-group-1");
    expect(group).not.toBeInTheDocument();

    const group2 = screen.queryByTestId("mock-expanded-group-2");
    expect(group2).not.toBeInTheDocument();
  });
});
