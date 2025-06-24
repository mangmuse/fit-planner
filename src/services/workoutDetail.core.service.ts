import { IWorkoutDetailAdapter } from "./../types/adapters";
import { LocalWorkoutDetail } from "@/types/models";
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
  ): Promise<LocalWorkoutDetail[]> {
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
  ): Promise<LocalWorkoutDetail[]> {
    const details = await this.repository.findAllByWorkoutId(workoutId);
    return details;
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
    selectedExercises: { id: number; name: string }[]
  ): Promise<number> {
    const newDetails = this.adapter.getNewWorkoutDetails(selectedExercises, {
      workoutId,
      startOrder,
    });
    const workoutDetails = await this.repository.bulkAdd(newDetails);

    return workoutDetails;
  }

  public async addSetToWorkout(lastSet: LocalWorkoutDetail): Promise<number> {
    const addSetInput = this.adapter.getAddSetToWorkoutByLastSet(lastSet);
    const newSet = await this.repository.add(addSetInput);
    return newSet;
  }

  public async addLocalWorkoutDetailsByUserDate(
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[]
  ): Promise<number> {
    if (selectedExercises.length === 0) {
      return 0;
    }
    const workout = await this.workoutService.addLocalWorkout(userId, date);
    const workoutId = workout.id!;

    const startOrder = await this.getStartExerciseOrder(workoutId);

    const newDetails = this.adapter.getNewWorkoutDetails(selectedExercises, {
      workoutId,
      startOrder,
    });

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
    details: LocalWorkoutDetail[]
  ): Promise<void> {
    if (details.length === 0) return;
    const ids = details.map((detail) => {
      if (!detail.id) throw new Error("id가 없습니다");
      return detail.id;
    });

    await this.repository.bulkDelete(ids);
  }
}
