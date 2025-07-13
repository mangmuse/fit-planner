import { IWorkoutDetailAdapter } from "./../types/adapters";
import { LocalWorkoutDetail, Saved } from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import { IWorkoutDetailCoreService, IWorkoutService } from "@/types/services";

export class WorkoutDetailCoreService implements IWorkoutDetailCoreService {
  constructor(
    private readonly repository: IWorkoutDetailRepository,
    private readonly adapter: IWorkoutDetailAdapter,
    private readonly workoutService: IWorkoutService
  ) {}

  async getLocalWorkoutDetails(
    userId: string,
    date: string
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    const workout = await this.workoutService.getWorkoutByUserIdAndDate(
      userId,
      date
    );

    if (workout?.id) {
      return this.repository.findAllByWorkoutId(workout.id);
    }

    await this.workoutService.addLocalWorkout(userId, date);
    return [];
  }

  async getLocalWorkoutDetailsByWorkoutId(
    workoutId: number
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    const details = await this.repository.findAllByWorkoutId(workoutId);
    return details;
  }

  public async getAllLocalWorkoutDetailsByWorkoutIds(
    workoutIds: number[]
  ): Promise<Saved<LocalWorkoutDetail>[]> {
    return this.repository.findAllByWorkoutIds(workoutIds);
  }

  async getStartExerciseOrder(workoutId: number): Promise<number> {
    const allDetails =
      await this.repository.findAllByWorkoutIdOrderByExerciseOrder(workoutId);
    const lastDetail = allDetails.at(-1);
    const startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
    return startOrder;
  }

  // add
  public async addLocalWorkoutDetail(
    detailInput: LocalWorkoutDetail
  ): Promise<void> {
    await this.repository.add(detailInput);
  }

  public async addLocalWorkoutDetailsByWorkoutId(
    workoutId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[],
    weightUnit: "kg" | "lbs" = "kg"
  ): Promise<number> {
    const newDetails = this.adapter.getNewWorkoutDetails(
      selectedExercises,
      {
        workoutId,
        startOrder,
      },
      weightUnit
    );
    const workoutDetails = await this.repository.bulkAdd(newDetails);

    return workoutDetails;
  }

  public async addPastWorkoutDetailsToWorkout(
    mappedDetails: LocalWorkoutDetail[]
  ): Promise<void> {
    if (mappedDetails.length === 0) return;
    await this.repository.bulkAdd(mappedDetails);
  }

  public async addSetToWorkout(
    lastSet: Saved<LocalWorkoutDetail>,
    weightUnit: "kg" | "lbs" = "kg"
  ): Promise<Saved<LocalWorkoutDetail>> {
    const addSetInput = this.adapter.getAddSetToWorkoutByLastSet(
      lastSet,
      weightUnit
    );
    const newSet = await this.repository.add(addSetInput);
    return { ...addSetInput, id: newSet };
  }

  public async addLocalWorkoutDetailsByUserDate(
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[],
    weightUnit: "kg" | "lbs" = "kg"
  ): Promise<number> {
    if (selectedExercises.length === 0) {
      return 0;
    }
    const workout = await this.workoutService.addLocalWorkout(userId, date);
    const workoutId = workout.id!;

    const startOrder = await this.getStartExerciseOrder(workoutId);

    const newDetails = this.adapter.getNewWorkoutDetails(
      selectedExercises,
      {
        workoutId,
        startOrder,
      },
      weightUnit
    );

    const workoutDetails = await this.repository.bulkAdd(newDetails);
    return workoutDetails;
  }

  // update

  public async updateLocalWorkoutDetail(
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ): Promise<void> {
    if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
    await this.repository.update(updateWorkoutInput.id, updateWorkoutInput);
  }

  public async updateWorkoutDetails(updatedDetails: LocalWorkoutDetail[]) {
    await this.repository.bulkPut(updatedDetails);
  }

  // delete
  public async deleteWorkoutDetail(lastSetId: number): Promise<void> {
    await this.repository.delete(lastSetId);
  }

  public async deleteWorkoutDetails(
    details: Saved<LocalWorkoutDetail>[]
  ): Promise<void> {
    if (details.length === 0) return;
    const ids = details.map((detail) => detail.id);

    await this.repository.bulkDelete(ids);
  }

  public async deleteDetailsByWorkoutId(workoutId: number): Promise<void> {
    const details = await this.repository.findAllByWorkoutId(workoutId);

    const ids = details.map((detail) => detail.id);
    await this.repository.bulkDelete(ids);
    await this.workoutService.deleteLocalWorkout(workoutId);
  }

  public async reorderExerciseOrderAfterDelete(
    workoutId: number,
    deletedExerciseOrder: number
  ): Promise<void> {
    const details = await this.repository.findAllByWorkoutId(workoutId);
    const updatedDetails = this.adapter.getReorderedDetailsAfterExerciseDelete(
      details,
      deletedExerciseOrder
    );

    if (updatedDetails.length > 0) {
      await this.updateWorkoutDetails(updatedDetails);
    }
  }

  public async reorderSetOrderAfterDelete(
    workoutId: number,
    exerciseId: number,
    deletedSetOrder: number
  ): Promise<void> {
    const details = await this.repository.findAllByWorkoutId(workoutId);
    const updatedDetails = this.adapter.getReorderedDetailsAfterSetDelete(
      details,
      exerciseId,
      deletedSetOrder
    );

    if (updatedDetails.length > 0) {
      await this.updateWorkoutDetails(updatedDetails);
    }
  }
}
