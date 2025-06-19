import { workoutDetailAdapter } from "@/adapter/workoutDetail.adapter";
import { workoutDetailApi } from "@/api/workoutDetail.api";
import { workoutRepository } from "@/repositories/workout.repository";
import { workoutDetailRepository } from "@/repositories/workoutDetail.repository";
import { exerciseService } from "@/services/exercise.service";
import { workoutService } from "@/services/workout.service";
import { WorkoutDetailCoreService } from "@/services/workoutDetail.core.service";
import { WorkoutDetailQueryService } from "@/services/workoutDetail.query.service";
import { WorkoutDetailSyncService } from "@/services/workoutDetail.sync.service";
import {
  IWorkoutDetailCoreService,
  IWorkoutDetailQueryService,
  IWorkoutDetailService,
  IWorkoutDetailSyncService,
} from "@/types/services";

export const workoutDetailCoreService: IWorkoutDetailCoreService =
  new WorkoutDetailCoreService(
    workoutDetailRepository,
    workoutDetailAdapter,
    workoutService
  );

export const workoutDetailSyncService: IWorkoutDetailSyncService =
  new WorkoutDetailSyncService(
    workoutDetailRepository,
    workoutDetailAdapter,
    workoutDetailApi,
    exerciseService,
    workoutService
  );
export const workoutDetailQueryService: IWorkoutDetailQueryService =
  new WorkoutDetailQueryService(workoutDetailRepository, workoutRepository);

export const workoutDetailService: IWorkoutDetailService = {
  ...workoutDetailCoreService,
  ...workoutDetailSyncService,
  ...workoutDetailQueryService,
};
