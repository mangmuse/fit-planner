import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import {
  getGroupedDetails,
  reorderDetailGroups,
} from "@/app/(main)/workout/_utils/getGroupedDetails";

describe("getGroupedDetails", () => {
  const mockDetails = [
    { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 1 },
    { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 2 },
    { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 3 },
    { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 1 },
    { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 2 },
    { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 3 },
    { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 1 },
    { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 2 },
    { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 3 },
  ];
  it("빈 배열을 입력하면 빈 배열을 반환해야 한다", () => {
    const result = getGroupedDetails([]);
    expect(result).toEqual([]);
  });

  it("exerciseOrder가 같은 detail끼리 한 그룹으로 묶는다", () => {
    const result = getGroupedDetails(mockDetails);
    expect(result).toEqual([
      { exerciseOrder: 1, details: mockDetails.slice(0, 3) },
      { exerciseOrder: 2, details: mockDetails.slice(3, 6) },
      { exerciseOrder: 3, details: mockDetails.slice(6, 9) },
    ]);
  });

  it("exercise순으로 정렬되며, 같은 그룹으로 내에서 setOrder순으로 정렬된다", () => {
    const unsortedDetails = [
      { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 1 },
      { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 2 },
      { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 2 },
      { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 1 },
      { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 2 },
      { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 1 },
    ];
    const result = getGroupedDetails(unsortedDetails);
    expect(result).toEqual([
      {
        exerciseOrder: 1,
        details: [
          { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 1 },
          { ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 2 },
        ],
      },
      {
        exerciseOrder: 2,
        details: [
          { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 1 },
          { ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 2 },
        ],
      },
      {
        exerciseOrder: 3,
        details: [
          { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 1 },
          { ...mockWorkoutDetail.past, exerciseOrder: 3, setOrder: 2 },
        ],
      },
    ]);
  });

  it("exerciseOrder와 setOrder가 연속적이지 않은 경우에도 1번부터 재정렬한다", () => {
    const nonSequentialDetails = [
      { ...mockWorkoutDetail.past, exerciseOrder: 5, setOrder: 8 },
      { ...mockWorkoutDetail.past, exerciseOrder: 10, setOrder: 4 },
    ];

    const result = getGroupedDetails(nonSequentialDetails);
    expect(result).toEqual([
      {
        exerciseOrder: 1,
        details: [{ ...mockWorkoutDetail.past, exerciseOrder: 1, setOrder: 1 }],
      },
      {
        exerciseOrder: 2,
        details: [{ ...mockWorkoutDetail.past, exerciseOrder: 2, setOrder: 1 }],
      },
    ]);
  });
});

describe("reorderDetailGroups", () => {
  const initialGroups = [
    {
      exerciseOrder: 1,
      details: [
        {
          ...mockWorkoutDetail.past,
          exerciseOrder: 1,
          exerciseName: "운동A",
        },
      ],
    },
    {
      exerciseOrder: 2,
      details: [
        {
          ...mockWorkoutDetail.past,
          exerciseOrder: 2,
          exerciseName: "운동B",
        },
      ],
    },
    {
      exerciseOrder: 3,
      details: [
        {
          ...mockWorkoutDetail.past,
          exerciseOrder: 3,
          exerciseName: "운동C",
        },
      ],
    },
  ];
  it("지정된 그룹을 새로운 위치로 정확히 이동시킨다", () => {
    const result = reorderDetailGroups(initialGroups, "1", "3");

    expect(result[2].details[0].exerciseName).toBe("운동A");
  });

  it("순서 변경 후 모든 그룹의 exerciseOrder를 1부터 순차적으로 재조정한다", () => {
    const result = reorderDetailGroups(initialGroups, "1", "3");

    result.forEach((group, index) => {
      expect(group.exerciseOrder).toBe(index + 1);
    });

    expect(result.length).toBe(3);
  });
});
