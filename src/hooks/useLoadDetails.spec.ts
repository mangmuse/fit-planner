jest.mock("@/lib/di");
import { mockWorkoutDetail } from "@/__mocks__/workoutDetail.mock";
import {
  IRoutineDetailService,
  IRoutineService,
  IWorkoutDetailService,
  IWorkoutService,
} from "./../types/services";
import {
  routineDetailService,
  routineService,
  workoutDetailService,
  workoutService,
} from "@/lib/di";
import { mockWorkout } from "@/__mocks__/workout.mock";
import useLoadDetails from "@/hooks/useLoadDetails";
import { renderHook, waitFor, act } from "@testing-library/react";
import { mockRoutine } from "@/__mocks__/routine.mock";
import { mockRoutineDetail } from "@/__mocks__/routineDetail.mock";
import { getGroupedDetails } from "@/app/(main)/workout/_utils/getGroupedDetails";
import { LocalWorkoutDetail, Saved } from "@/types/models";

const mockWorkoutService =
  workoutService as unknown as jest.Mocked<IWorkoutService>;

const mockWorkoutDetailService =
  workoutDetailService as unknown as jest.Mocked<IWorkoutDetailService>;

const mockRoutineService =
  routineService as unknown as jest.Mocked<IRoutineService>;

const mockRoutineDetailService =
  routineDetailService as unknown as jest.Mocked<IRoutineDetailService>;

const mockWorkoutDetails = [
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 2,
    id: 1,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 2,
    setOrder: 1,
    id: 2,
  },
  {
    ...mockWorkoutDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 1,
    id: 3,
  },
];

const mockRoutineDetails = [
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 1,
    id: 1,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 1,
    setOrder: 2,
    id: 2,
  },
  {
    ...mockRoutineDetail.past,
    exerciseName: "벤치프레스",
    exerciseOrder: 2,
    setOrder: 1,
    id: 3,
  },
];
const mockW = mockWorkout.planned;
const mockR = mockRoutine.default;

describe("useLoadDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("type이 RECORD일 때, 운동 세부 정보를 올바르게 그루핑하여 반환한다", async () => {
    mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
      mockWorkoutDetails
    );
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);
    mockWorkoutService.updateLocalWorkout.mockResolvedValue();

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    const expectedGroups = getGroupedDetails(mockWorkoutDetails);
    await waitFor(() => {
      expect(result.current.workout).toEqual(mockW);
      expect(result.current.workoutGroups).toEqual(expectedGroups);
      expect(result.current.workoutGroups[0].details.map((d) => d.id)).toEqual([
        3, 1,
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it("type이 ROUTINE일 때, 운동 세부 정보를 올바르게 그루핑하여 반환한다", async () => {
    mockRoutineDetailService.getLocalRoutineDetails.mockResolvedValue(
      mockRoutineDetails
    );
    mockRoutineService.getRoutineByLocalId.mockResolvedValue(mockR);
    mockRoutineService.updateLocalRoutine.mockResolvedValue();

    const { result } = renderHook(() =>
      useLoadDetails({
        type: "ROUTINE",
        userId: "1",
        date: "2025-06-29",
        routineId: 1,
      })
    );
    const expectedGroups = getGroupedDetails(mockRoutineDetails);
    await waitFor(() => {
      expect(result.current.workout).toBeNull();
      expect(result.current.workoutGroups).toEqual(expectedGroups);
      expect(result.current.workoutGroups[0].details.map((d) => d.id)).toEqual([
        1, 2,
      ]);
    });
  });

  it("초기 렌더링 시, 로딩 상태가 true에서 false로 변경된다", async () => {
    mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
      mockWorkoutDetails
    );
    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("데이터 로딩에 실패하면, 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    const mockError = new Error("데이터 로딩 실패");
    mockWorkoutDetailService.getLocalWorkoutDetails.mockRejectedValue(
      mockError
    );
    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        "운동 세부 정보를 불러오는데 실패했습니다"
      );
    });
  });
  it("상태 동기화에 실패하면, 에러를 설정하고 로딩 상태를 false로 변경한다", async () => {
    mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
      mockWorkoutDetails
    );
    mockWorkoutService.getWorkoutByUserIdAndDate.mockResolvedValue(mockW);
    mockWorkoutService.updateLocalWorkout.mockRejectedValue(
      new Error("상태 동기화 실패")
    );
    const { result } = renderHook(() =>
      useLoadDetails({
        type: "RECORD",
        userId: "1",
        date: "2025-06-29",
      })
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(
        "운동 상태를 동기화하는데 실패했습니다"
      );
    });
  });

  describe("updateDetailInGroups", () => {
    beforeEach(() => {
      mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
        mockWorkoutDetails
      );
    });
    it("전달받은 updateDetail을 그룹에 반영한다", async () => {
      const mockGroups = getGroupedDetails(mockWorkoutDetails);
      const mockUpdatedDetail = {
        ...mockWorkoutDetails[0],
        reps: 1515,
      };
      const expectedGroups = mockGroups.map((group) => ({
        ...group,
        details: group.details.map((d) =>
          d.id === mockUpdatedDetail.id ? mockUpdatedDetail : d
        ),
      }));

      const { result } = renderHook(() =>
        useLoadDetails({
          type: "RECORD",
          userId: "1",
          date: "2025-06-29",
        })
      );

      await waitFor(() => {
        expect(result.current.workoutGroups).toEqual(mockGroups);
      });

      act(() => {
        result.current.updateDetailInGroups(mockUpdatedDetail);
      });

      expect(result.current.workoutGroups).toEqual(expectedGroups);
    });

    it("전달받은 updatedDetail이 그룹에 존재하지 않으면, 그룹을 그대로 유지한다", async () => {
      const mockGroups = getGroupedDetails(mockWorkoutDetails);
      const mockUpdatedDetail = {
        ...mockWorkoutDetail.past,
        exerciseName: "벤치프레스",
        exerciseOrder: 1,
        setOrder: 1,
        id: 4,
      };

      const { result } = renderHook(() =>
        useLoadDetails({
          type: "RECORD",
          userId: "1",
          date: "2025-06-29",
        })
      );

      await waitFor(() => {
        expect(result.current.workoutGroups).toEqual(mockGroups);
      });

      act(() => {
        result.current.updateDetailInGroups(mockUpdatedDetail);
      });

      expect(result.current.workoutGroups).toEqual(mockGroups);
    });
  });

  describe("addDetailToGroup", () => {
    beforeEach(() => {
      mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
        mockWorkoutDetails
      );
    });

    it("lastDetail이 그룹내에 존재하면, lastDetail 뒤에 새로운 detail을 추가한다", async () => {
      const simpleDetails: Saved<LocalWorkoutDetail>[] = [
        {
          ...mockWorkoutDetails[0],
          id: 1,
          exerciseOrder: 1,
          setOrder: 1,
        },
        {
          ...mockWorkoutDetails[0],
          id: 2,
          exerciseOrder: 1,
          setOrder: 3,
        },
      ];
      mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
        simpleDetails
      );

      const { result } = renderHook(() =>
        useLoadDetails({
          type: "RECORD",
          userId: "1",
          date: "2025-06-29",
        })
      );

      await waitFor(() => {
        expect(result.current.workoutGroups).toHaveLength(1);
        expect(result.current.workoutGroups[0].details).toHaveLength(2);
      });

      const mockLastDetail = result.current.workoutGroups[0].details[0]; // 첫 번째 detail (id: 1)
      const mockNewDetail: Saved<LocalWorkoutDetail> = {
        ...mockWorkoutDetails[0],
        id: 5000,
        exerciseOrder: 1,
        setOrder: 2, // 1과 3 사이에 삽입
      };

      act(() => {
        result.current.addDetailToGroup(mockNewDetail, mockLastDetail);
      });

      const details = result.current.workoutGroups[0].details;
      expect(details).toHaveLength(3);
      expect(details[0].id).toBe(1);
      expect(details[1].id).toBe(5000);
      expect(details[2].id).toBe(2);
    });

    it("lastDetail이 그룹내에 존재하지 않으면 그룹을 그대로 유지한다", async () => {
      const groupDetails: Saved<LocalWorkoutDetail>[] = [
        {
          ...mockWorkoutDetails[0],
          id: 1,
          exerciseOrder: 1,
          setOrder: 1,
        },
        {
          ...mockWorkoutDetails[0],
          id: 2,
          exerciseOrder: 2,
          setOrder: 1,
        },
      ];
      mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
        groupDetails
      );

      const { result } = renderHook(() =>
        useLoadDetails({
          type: "RECORD",
          userId: "1",
          date: "2025-06-29",
        })
      );

      await waitFor(() => {
        expect(result.current.workoutGroups).toHaveLength(2);
      });

      const nonExistentDetail: Saved<LocalWorkoutDetail> = {
        ...mockWorkoutDetails[0],
        id: 999,
        exerciseOrder: 1,
        setOrder: 1,
      };

      const mockNewDetail: Saved<LocalWorkoutDetail> = {
        ...mockWorkoutDetails[0],
        id: 5000,
        exerciseOrder: 1,
        setOrder: 2,
      };

      act(() => {
        result.current.addDetailToGroup(mockNewDetail, nonExistentDetail);
      });
      const expected = getGroupedDetails(groupDetails);
      expect(result.current.workoutGroups).toEqual(expected);
    });

    describe("routine 타입", () => {
      beforeEach(() => {
        mockRoutineDetailService.getLocalRoutineDetails.mockResolvedValue(
          mockRoutineDetails
        );
      });

      it("lastDetail이 그룹내에 존재하면, lastDetail 뒤에 새로운 detail을 추가한다", async () => {
        const simpleDetails = [
          {
            ...mockRoutineDetails[0],
            id: 1,
            exerciseOrder: 1,
            setOrder: 1,
          },
          {
            ...mockRoutineDetails[0],
            id: 2,
            exerciseOrder: 1,
            setOrder: 3,
          },
        ];
        mockRoutineDetailService.getLocalRoutineDetails.mockResolvedValue(
          simpleDetails
        );

        const { result } = renderHook(() =>
          useLoadDetails({
            type: "ROUTINE",
            userId: "1",
            date: "2025-06-29",
            routineId: 1,
          })
        );

        await waitFor(() => {
          expect(result.current.workoutGroups).toHaveLength(1);
          expect(result.current.workoutGroups[0].details).toHaveLength(2);
        });

        const mockLastDetail = result.current.workoutGroups[0].details[0];
        const mockNewDetail = {
          ...mockRoutineDetails[0],
          id: 5000,
          exerciseOrder: 1,
          setOrder: 2,
        };

        act(() => {
          result.current.addDetailToGroup(mockNewDetail, mockLastDetail);
        });

        const details = result.current.workoutGroups[0].details;
        expect(details).toHaveLength(3);
        expect(details[0].id).toBe(1);
        expect(details[1].id).toBe(5000);
        expect(details[2].id).toBe(2);
      });

      it("lastDetail이 그룹내에 존재하지 않으면 그룹을 그대로 유지한다", async () => {
        const groupDetails = [
          {
            ...mockRoutineDetails[0],
            id: 1,
            exerciseOrder: 1,
            setOrder: 1,
          },
          {
            ...mockRoutineDetails[0],
            id: 2,
            exerciseOrder: 2,
            setOrder: 1,
          },
        ];
        mockRoutineDetailService.getLocalRoutineDetails.mockResolvedValue(
          groupDetails
        );

        const { result } = renderHook(() =>
          useLoadDetails({
            type: "ROUTINE",
            userId: "1",
            date: "2025-06-29",
            routineId: 1,
          })
        );

        await waitFor(() => {
          expect(result.current.workoutGroups).toHaveLength(2);
        });

        const nonExistentDetail = {
          ...mockRoutineDetails[0],
          id: 999,
          exerciseOrder: 1,
          setOrder: 1,
        };

        const mockNewDetail = {
          ...mockRoutineDetails[0],
          id: 5000,
          exerciseOrder: 1,
          setOrder: 2,
        };

        act(() => {
          result.current.addDetailToGroup(mockNewDetail, nonExistentDetail);
        });

        const expected = getGroupedDetails(groupDetails);
        expect(result.current.workoutGroups).toEqual(expected);
      });
    });

    describe("removeDetailFromGroup", () => {
      beforeEach(() => {
        mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
          mockWorkoutDetails
        );
      });

      it("전달받은 detailId가 그룹내에 존재하면, 그룹에서 제거한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockDetailId = mockWorkoutDetails[0].id;

        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.removeDetailFromGroup(mockDetailId);
        });

        const expected = [
          {
            exerciseOrder: 1,
            details: [mockWorkoutDetails[2]],
          },
          {
            exerciseOrder: 2,
            details: [mockWorkoutDetails[1]],
          },
        ];
        expect(result.current.workoutGroups).toEqual(expected);
      });

      it("전달받은 detailId가 그룹내에 존재하지 않으면, 그룹을 그대로 유지한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockDetailId = 999;

        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.removeDetailFromGroup(mockDetailId);
        });
        expect(result.current.workoutGroups).toEqual(mockGroups);
      });
    });
    describe("updateMultipleDetailsInGroups", () => {
      beforeEach(() => {
        mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
          mockWorkoutDetails
        );
      });
      it("전달받은 updatedDetails가 그룹내에 존재하면, 그룹에 반영한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockUpdatedDetails = [
          {
            ...mockWorkoutDetails[0],
            id: 1,
            reps: 1234,
          },
          {
            ...mockWorkoutDetails[2],
            id: 3,
            reps: 5678,
          },
        ];

        const expected = [
          {
            exerciseOrder: 1,
            details: [
              {
                ...mockWorkoutDetails[2],
                reps: 5678,
              },
              {
                ...mockWorkoutDetails[0],
                reps: 1234,
              },
            ],
          },
          {
            exerciseOrder: 2,
            details: [mockWorkoutDetails[1]],
          },
        ];

        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.updateMultipleDetailsInGroups(mockUpdatedDetails);
        });
        expect(result.current.workoutGroups).toEqual(expected);
      });
      it("전달받은 updatedDetails가 그룹내에 존재하지 않으면, 그룹을 그대로 유지한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockUpdatedDetails = [
          {
            ...mockWorkoutDetails[0],
            id: 987,
            reps: 1234,
          },
        ];
        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.updateMultipleDetailsInGroups(mockUpdatedDetails);
        });
        const expected = mockGroups;
        expect(result.current.workoutGroups).toEqual(expected);
      });
    });
    describe("removeMultipleDetailsInGroup", () => {
      beforeEach(() => {
        mockWorkoutDetailService.getLocalWorkoutDetails.mockResolvedValue(
          mockWorkoutDetails
        );
      });
      it("전달받은 details가 그룹내에 존재하면, 그룹에서 제거한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockDetails = [mockWorkoutDetails[0], mockWorkoutDetails[2]];
        const expected = [
          {
            exerciseOrder: 1,
            details: [mockWorkoutDetails[1]],
          },
        ];
        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.removeMultipleDetailsInGroup(mockDetails);
        });
        expect(result.current.workoutGroups).toEqual(expected);
      });
      it("전달받은 details가 그룹내에 존재하지 않으면, 그룹을 그대로 유지한다", async () => {
        const mockGroups = getGroupedDetails(mockWorkoutDetails);
        const mockDetails = [
          { ...mockWorkoutDetails[0], id: 123 },
          { ...mockWorkoutDetails[2], id: 456 },
        ];
        const expected = mockGroups;
        const { result } = renderHook(() =>
          useLoadDetails({
            type: "RECORD",
            userId: "1",
            date: "2025-06-29",
          })
        );
        await waitFor(() => {
          expect(result.current.workoutGroups).toEqual(mockGroups);
        });

        act(() => {
          result.current.removeMultipleDetailsInGroup(mockDetails);
        });
        expect(result.current.workoutGroups).toEqual(expected);
      });
    });
  });
});
