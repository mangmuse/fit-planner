import { isWorkoutDetails } from "@/app/(main)/workout/_utils/checkIsWorkoutDetails";
import { workoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import {
  IWorkoutDetailRepository,
  IWorkoutRepository,
} from "@/types/repositories";
import { IWorkoutDetailQueryService } from "@/types/services";

export class WorkoutDetailQueryService implements IWorkoutDetailQueryService {
  constructor(
    private readonly repository: IWorkoutDetailRepository,
    private readonly workoutRepository: IWorkoutRepository
  ) {}

  async getWorkoutGroupByWorkoutDetail(
    detail: LocalWorkoutDetail
  ): Promise<LocalWorkoutDetail[]> {
    const { exerciseOrder, workoutId } = detail;
    try {
      return this.repository.findAllByWorkoutIdAndExerciseOrder(
        workoutId,
        exerciseOrder
      );
    } catch (e) {
      throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
    }
  }

  async getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<LocalWorkoutDetail[]> {
    try {
      return this.repository.findAllByWorkoutIdAndExerciseOrder(
        workoutId,
        exerciseOrder
      );
    } catch (e) {
      throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
    }
  }
  private async getAllDoneDetailsExceptCurrent(
    details: LocalWorkoutDetail[] | LocalRoutineDetail[]
  ): Promise<LocalWorkoutDetail[]> {
    try {
      const isWorkout = isWorkoutDetails(details);
      let candidates = await this.repository.findAllDoneByExerciseId(
        details[0].exerciseId
      );
      if (isWorkout) {
        const currentWorkoutId = details[0].workoutId;
        candidates = candidates.filter((d) => d.workoutId !== currentWorkoutId);
      }
      return candidates;
    } catch (e) {
      throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
    }
  }
  private async pickMostRecentDetailBeforeDate(
    candidates: LocalWorkoutDetail[],
    referenceDate?: Date
  ): Promise<LocalWorkoutDetail | undefined> {
    if (!candidates.length) return undefined;

    try {
      const workoutIdToDateMap = new Map<number, string>();
      for (const detail of candidates) {
        if (!workoutIdToDateMap.has(detail.workoutId)) {
          const w = await this.workoutRepository.findOneById(detail.workoutId);
          if (w?.date) {
            workoutIdToDateMap.set(detail.workoutId, w.date);
          }
        }
      }

      let filtered = candidates;
      if (referenceDate) {
        filtered = filtered.filter((d) => {
          const dateString = workoutIdToDateMap.get(d.workoutId);
          if (!dateString) return false;
          const workoutDate = new Date(dateString);
          return workoutDate <= referenceDate;
        });
      }
      if (!filtered.length) return undefined;
      filtered.sort((a, b) => {
        const dateA = workoutIdToDateMap.get(a.workoutId) || "";
        const dateB = workoutIdToDateMap.get(b.workoutId) || "";
        return dateB.localeCompare(dateA);
      });
      return filtered[0];
    } catch (e) {
      throw new Error("가장 최근 WorkoutDetail을 찾는 데 실패했습니다");
    }
  }
  /**
   * 주어진 details(현재 워크아웃 또는 루틴 디테일 배열)에서
   *   1. exerciseId가 같고 isDone이 true인 모든 LocalWorkoutDetail을 가져온 뒤,
   *   2. “현재 디테일이 속한 워크아웃의 날짜” 이전(혹은 같음)의 것만 남긴 다음,
   *   3. 그중 가장 최근 날짜(내림차순 정렬)인 하나를 반환
   *
   * @param details 현재 화면에 표시된 디테일 그룹 (LocalWorkoutDetail[] or LocalRoutineDetail[])
   * @returns 가장 최신인 LocalWorkoutDetail 혹은, 없으면 undefined
   */
  async getLatestWorkoutDetailByExerciseId(
    details: LocalWorkoutDetail[] | LocalRoutineDetail[]
  ): Promise<LocalWorkoutDetail | void> {
    try {
      const isWorkout = isWorkoutDetails(details);
      const candidates = await this.getAllDoneDetailsExceptCurrent(details);
      if (!candidates.length) return;
      let referenceDate: Date | undefined = undefined;
      if (isWorkout) {
        const currentWorkout = await this.workoutRepository.findOneById(
          details[0].workoutId
        );
        if (!currentWorkout?.date) return;
        referenceDate = new Date(currentWorkout.date);
      }
      const mostRecent = await this.pickMostRecentDetailBeforeDate(
        candidates,
        referenceDate
      );
      return mostRecent;
    } catch (e) {
      throw new Error("가장 최근 WorkoutDetail을 찾는 데 실패했습니다");
    }
  }
}
