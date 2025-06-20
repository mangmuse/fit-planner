import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import { workoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { LocalWorkoutDetail } from "@/types/models";
import { IWorkoutDetailRepository } from "@/types/repositories";
import { IWorkoutDetailCoreService, IWorkoutService } from "@/types/services";

export class WorkoutDetailCoreService implements IWorkoutDetailCoreService {
  constructor(
    private readonly repository: IWorkoutDetailRepository,
    private readonly adapter: typeof workoutDetailAdapter,
    private readonly workoutService: IWorkoutService
  ) {}

  async getLocalWorkoutDetails(
    userId: string,
    date: string
  ): Promise<LocalWorkoutDetail[]> {
    try {
      let workout = await this.workoutService.getWorkoutByUserIdAndDate(
        userId,
        date
      );

      if (!workout) {
        workout = await this.workoutService.addLocalWorkout(userId, date);
      }

      if (!workout?.id) throw new Error("workoutId를 가져오지 못했습니다");

      const details = await this.repository.findAllByWorkoutId(workout.id);

      return details;
    } catch (e) {
      throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
    }
  }

  async getLocalWorkoutDetailsByWorkoutId(
    workoutId: number
  ): Promise<LocalWorkoutDetail[]> {
    if (!workoutId) throw new Error("workoutId가 없습니다");
    try {
      const details = await this.repository.findAllByWorkoutId(workoutId);
      return details;
    } catch (e) {
      throw new Error("WorkoutDetails를 불러오는 데 실패했습니다");
    }
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
    try {
      await this.repository.add(detailInput);
    } catch (e) {
      throw new Error("WorkoutDetail 추가에 실패했습니다");
    }
  }

  public async addLocalWorkoutDetailsByWorkoutId(
    workoutId: number,
    startOrder: number,
    selectedExercises: { id: number; name: string }[]
  ): Promise<number> {
    try {
      if (startOrder == null) {
        startOrder = await this.getStartExerciseOrder(workoutId);
      }
      const newDetails = this.adapter.getNewWorkoutDetails(selectedExercises, {
        workoutId,
        startOrder,
      });
      const workoutDetails = await this.repository.bulkAdd(newDetails);

      return workoutDetails;
    } catch (e) {
      throw new Error("WorkoutDetails 추가에 실패했습니다");
    }
  }

  public async addSetToWorkout(lastSet: LocalWorkoutDetail): Promise<number> {
    try {
      const addSetInput = this.adapter.getAddSetToWorkoutByLastSet(lastSet);
      const newSet = await this.repository.add(addSetInput);
      return newSet;
    } catch (e) {
      throw new Error("WorkoutDetail 추가에 실패했습니다");
    }
  }

  public async addLocalWorkoutDetailsByUserDate(
    userId: string,
    date: string,
    selectedExercises: { id: number | undefined; name: string }[]
  ): Promise<number> {
    try {
      const workout = await this.workoutService.addLocalWorkout(userId, date);
      const workoutId = workout.id!;

      const startOrder = await this.getStartExerciseOrder(workoutId);

      const newDetails = this.adapter.getNewWorkoutDetails(selectedExercises, {
        workoutId,
        startOrder,
      });

      const workoutDetails = await this.repository.bulkAdd(newDetails);
      return workoutDetails;
    } catch (e) {
      throw new Error("WorkoutDetails 추가에 실패했습니다");
    }
  }

  // update

  public async updateLocalWorkoutDetail(
    updateWorkoutInput: Partial<LocalWorkoutDetail>
  ): Promise<void> {
    if (!updateWorkoutInput.id) throw new Error("id가 없습니다");
    try {
      await this.repository.update(updateWorkoutInput.id, updateWorkoutInput);
    } catch (e) {
      throw new Error("WorkoutDetail 업데이트에 실패했습니다");
    }
  }

  public async updateWorkoutDetails(updatedDetails: LocalWorkoutDetail[]) {
    try {
      await this.repository.bulkPut(updatedDetails);
    } catch (e) {
      throw new Error("WorkoutDetails 업데이트에 실패했습니다");
    }
  }

  // delete
  public async deleteWorkoutDetail(lastSetId: number): Promise<void> {
    try {
      await this.repository.delete(lastSetId);
    } catch (e) {
      throw new Error("WorkoutDetail 삭제에 실패했습니다");
    }
  }

  public async deleteWorkoutDetails(
    details: LocalWorkoutDetail[]
  ): Promise<void> {
    try {
      await Promise.all(
        details.map(async (detail) => {
          if (!detail.id) throw new Error("id가 없습니다");
          await this.repository.delete(detail.id);
        })
      );
    } catch (e) {
      throw new Error("WorkoutDetails 삭제에 실패했습니다");
    }
  }
}
