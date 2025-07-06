import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";
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
    detail: Saved<LocalWorkoutDetail>
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    const { exerciseOrder, workoutId } = detail;
    return this.repository.findAllByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  }

  async getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.repository.findAllByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  }

  async getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
    pairs: { workoutId: number; exerciseOrder: number }[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.repository.findAllByWorkoutIdAndExerciseOrderPairs(pairs);
  }

  private async getAllDoneDetailsExceptCurrent(
    detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    // 직접 타입 체크: "workoutId"가 있으면 LocalWorkoutDetail
    const isWorkout = "workoutId" in detail;
    let candidates = await this.repository.findAllDoneByExerciseId(
      detail.exerciseId
    );
    if (isWorkout) {
      const currentWorkoutId = (detail as Saved<LocalWorkoutDetail>).workoutId;
      candidates = candidates.filter((d) => d.workoutId !== currentWorkoutId);
    }
    return candidates;
  }
  private async pickMostRecentDetailBeforeDate(
    candidates: Saved<LocalWorkoutDetail>[],
    referenceDate?: Date
  ): Promise<Saved<LocalWorkoutDetail> | undefined> {
    if (!candidates.length) return undefined;

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
  }

  async getLatestWorkoutDetailByDetail(
    detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ): Promise<Saved<LocalWorkoutDetail> | void> {
    const isWorkout = "workoutId" in detail;
    const candidates = await this.getAllDoneDetailsExceptCurrent(detail);
    if (!candidates.length) return;
    let referenceDate: Date | undefined = undefined;
    if (isWorkout) {
      const currentWorkout = await this.workoutRepository.findOneById(
        (detail as Saved<LocalWorkoutDetail>).workoutId
      );
      if (!currentWorkout?.date) return;
      referenceDate = new Date(currentWorkout.date);
    }
    const mostRecent = await this.pickMostRecentDetailBeforeDate(
      candidates,
      referenceDate
    );
    return mostRecent;
  }
}
