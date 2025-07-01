import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";

import {
  IWorkoutDetailCoreService,
  IWorkoutDetailQueryService,
  IWorkoutDetailService,
  IWorkoutDetailSyncService,
} from "@/types/services";

export class WorkoutDetailService implements IWorkoutDetailService {
  constructor(
    private readonly core: IWorkoutDetailCoreService,
    private readonly query: IWorkoutDetailQueryService,
    private readonly sync: IWorkoutDetailSyncService
  ) {}

  // --- Core ---

  getLocalWorkoutDetails(
    userId: string,
    date: string
  ): Promise<LocalWorkoutDetail[]> {
    return this.core.getLocalWorkoutDetails(userId, date);
  }

  getLocalWorkoutDetailsByWorkoutId(
    workoutId: number
  ): Promise<LocalWorkoutDetail[]> {
    return this.core.getLocalWorkoutDetailsByWorkoutId(workoutId);
  }

  getStartExerciseOrder(workoutId: number): Promise<number> {
    return this.core.getStartExerciseOrder(workoutId);
  }

  addLocalWorkoutDetail(detailInput: LocalWorkoutDetail): Promise<void> {
    return this.core.addLocalWorkoutDetail(detailInput);
  }

  addLocalWorkoutDetailsByWorkoutId(
    workoutId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ): Promise<number> {
    return this.core.addLocalWorkoutDetailsByWorkoutId(
      workoutId,
      startOrder,
      selectedExercises
    );
  }

  addPastWorkoutDetailsToWorkout(
    mappedDetails: LocalWorkoutDetail[]
  ): Promise<void> {
    return this.core.addPastWorkoutDetailsToWorkout(mappedDetails);
  }

  addSetToWorkout(lastSet: LocalWorkoutDetail): Promise<number> {
    return this.core.addSetToWorkout(lastSet);
  }

  addLocalWorkoutDetailsByUserDate(
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[]
  ): Promise<number> {
    return this.core.addLocalWorkoutDetailsByUserDate(
      userId,
      date,
      selectedExercises
    );
  }

  updateLocalWorkoutDetail(
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ): Promise<void> {
    return this.core.updateLocalWorkoutDetail(updateWorkoutInput);
  }

  updateWorkoutDetails(updatedDetails: LocalWorkoutDetail[]): Promise<void> {
    return this.core.updateWorkoutDetails(updatedDetails);
  }

  deleteWorkoutDetail(lastSetId: number): Promise<void> {
    return this.core.deleteWorkoutDetail(lastSetId);
  }

  deleteWorkoutDetails(details: LocalWorkoutDetail[]): Promise<void> {
    return this.core.deleteWorkoutDetails(details);
  }

  // --- Query ---

  getWorkoutGroupByWorkoutDetail(
    detail: LocalWorkoutDetail
  ): Promise<LocalWorkoutDetail[]> {
    return this.query.getWorkoutGroupByWorkoutDetail(detail);
  }

  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<LocalWorkoutDetail[]> {
    return this.query.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  }

  getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
    pairs: { workoutId: number; exerciseOrder: number }[]
  ): Promise<LocalWorkoutDetail[]> {
    return this.query.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
      pairs
    );
  }

  getLatestWorkoutDetailByExerciseId(
    detail: LocalWorkoutDetail | LocalRoutineDetail
  ): Promise<LocalWorkoutDetail | void> {
    return this.query.getLatestWorkoutDetailByExerciseId(detail);
  }

  // --- Sync Service ---

  overwriteWithServerWorkoutDetails(userId: string): Promise<void> {
    return this.sync.overwriteWithServerWorkoutDetails(userId);
  }

  syncToServerWorkoutDetails(): Promise<void> {
    return this.sync.syncToServerWorkoutDetails();
  }
}
