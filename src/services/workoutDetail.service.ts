import { LocalRoutineDetail, LocalWorkoutDetail, Saved } from "@/types/models";

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

  public getLocalWorkoutDetails(
    userId: string,
    date: string
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.core.getLocalWorkoutDetails(userId, date);
  }

  public getLocalWorkoutDetailsByWorkoutId(
    workoutId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.core.getLocalWorkoutDetailsByWorkoutId(workoutId);
  }

  public getAllLocalWorkoutDetailsByWorkoutIds(
    workoutIds: number[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.core.getAllLocalWorkoutDetailsByWorkoutIds(workoutIds);
  }

  public getStartExerciseOrder(workoutId: number): Promise<number> {
    return this.core.getStartExerciseOrder(workoutId);
  }

  public addLocalWorkoutDetail(detailInput: LocalWorkoutDetail): Promise<void> {
    return this.core.addLocalWorkoutDetail(detailInput);
  }

  public addLocalWorkoutDetailsByWorkoutId(
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

  public addPastWorkoutDetailsToWorkout(
    mappedDetails: LocalWorkoutDetail[]
  ): Promise<void> {
    return this.core.addPastWorkoutDetailsToWorkout(mappedDetails);
  }

  public addSetToWorkout(lastSet: LocalWorkoutDetail): Promise<number> {
    return this.core.addSetToWorkout(lastSet);
  }

  public addLocalWorkoutDetailsByUserDate(
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

  public updateLocalWorkoutDetail(
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ): Promise<void> {
    return this.core.updateLocalWorkoutDetail(updateWorkoutInput);
  }

  public updateWorkoutDetails(
    updatedDetails: LocalWorkoutDetail[]
  ): Promise<void> {
    return this.core.updateWorkoutDetails(updatedDetails);
  }

  public deleteWorkoutDetail(lastSetId: number): Promise<void> {
    return this.core.deleteWorkoutDetail(lastSetId);
  }

  public deleteWorkoutDetails(details: LocalWorkoutDetail[]): Promise<void> {
    return this.core.deleteWorkoutDetails(details);
  }

  // --- Query ---

  public getWorkoutGroupByWorkoutDetail(
    detail: LocalWorkoutDetail
  ): Promise<LocalWorkoutDetail[]> {
    return this.query.getWorkoutGroupByWorkoutDetail(detail);
  }

  public getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
    workoutId: number,
    exerciseOrder: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.query.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrder(
      workoutId,
      exerciseOrder
    );
  }

  public getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
    pairs: { workoutId: number; exerciseOrder: number }[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.query.getLocalWorkoutDetailsByWorkoutIdAndExerciseOrderPairs(
      pairs
    );
  }

  public getLatestWorkoutDetailByDetail(
    detail: Saved<LocalWorkoutDetail> | Saved<LocalRoutineDetail>
  ): Promise<Saved<LocalWorkoutDetail> | void> {
    return this.query.getLatestWorkoutDetailByDetail(detail);
  }

  // --- Sync Service ---

  public overwriteWithServerWorkoutDetails(userId: string): Promise<void> {
    return this.sync.overwriteWithServerWorkoutDetails(userId);
  }

  // syncToServerWorkoutDetails(): Promise<void> {
  //   return this.sync.syncToServerWorkoutDetails();
  // }
}
