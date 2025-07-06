import { ExerciseAdapter } from "@/adapter/exercise.adapter";
import { RoutineDetailAdapter } from "@/adapter/routineDetail.adapter";
import { SyncAllAdapter } from "@/adapter/syncAll.adapter.";

import { WorkoutdetailAdapter } from "@/adapter/workoutDetail.adapter";
import { ExerciseApi } from "@/api/exercise.api";
import { RoutineApi } from "@/api/routine.api";
import { RoutineDetailApi } from "@/api/routineDetail.api";
import { WorkoutApi } from "@/api/workout.api";
import { WorkoutDetailApi } from "@/api/workoutDetail.api";
import { SyncAllApi } from "@/api/syncAll.api";
import { db } from "@/lib/db";
import { ExerciseRepository } from "@/repositories/exercise.repository";
import { RoutineRepository } from "@/repositories/routine.repository";

import { RoutineDetailRepository } from "@/repositories/routineDetail.repository";
import { WorkoutRepository } from "@/repositories/workout.repository";
import { WorkoutDetailRepository } from "@/repositories/workoutDetail.repository";

import { ExerciseService } from "@/services/exercise.service";
import { RoutineService } from "@/services/routine.service";

import { RoutineDetailService } from "@/services/routineDetail.service";
import { SyncAllService } from "@/services/syncAll.service";

import { WorkoutService } from "@/services/workout.service";
import { WorkoutDetailCoreService } from "@/services/workoutDetail.core.service";
import { WorkoutDetailQueryService } from "@/services/workoutDetail.query.service";
import { WorkoutDetailService } from "@/services/workoutDetail.service";
import { WorkoutDetailSyncService } from "@/services/workoutDetail.sync.service";
import {
  IWorkoutDetailCoreService,
  IWorkoutDetailQueryService,
  IWorkoutDetailService,
  IWorkoutDetailSyncService,
} from "@/types/services";

// ------ API ----- //

export const exerciseApi = new ExerciseApi();
export const workoutApi = new WorkoutApi();
export const workoutDetailApi = new WorkoutDetailApi();
export const routineApi = new RoutineApi();
export const routineDetailApi = new RoutineDetailApi();

// ------ Repository ----- //

export const exerciseRepository = new ExerciseRepository(db.exercises);
export const routineRepository = new RoutineRepository(db.routines);
export const routineDetailRepository = new RoutineDetailRepository(
  db.routineDetails
);
export const workoutRepository = new WorkoutRepository(db.workouts);
export const workoutDetailRepository = new WorkoutDetailRepository(
  db.workoutDetails
);
export const syncAllApi = new SyncAllApi();

// ------ Adapter ----- //
export const exerciseAdapter = new ExerciseAdapter();

export const workoutDetailAdapter = new WorkoutdetailAdapter();
export const routineDetailAdapter = new RoutineDetailAdapter();

export const syncAllAdapter = new SyncAllAdapter();

// ----- Service ----- //

export const exerciseService = new ExerciseService(
  exerciseRepository,
  exerciseAdapter,
  exerciseApi
);

export const workoutService = new WorkoutService(workoutRepository, workoutApi);
export const routineService = new RoutineService(routineRepository, routineApi);

const workoutDetailCoreService: IWorkoutDetailCoreService =
  new WorkoutDetailCoreService(
    workoutDetailRepository,
    workoutDetailAdapter,
    workoutService
  );

const workoutDetailSyncService: IWorkoutDetailSyncService =
  new WorkoutDetailSyncService(
    workoutDetailRepository,
    workoutDetailAdapter,
    workoutDetailApi,
    exerciseService,
    workoutService
  );
const workoutDetailQueryService: IWorkoutDetailQueryService =
  new WorkoutDetailQueryService(workoutDetailRepository, workoutRepository);

// export const workoutDetailService: IWorkoutDetailService = {
//   ...workoutDetailCoreService,
//   ...workoutDetailSyncService,
//   ...workoutDetailQueryService,
// };

export const workoutDetailService = new WorkoutDetailService(
  workoutDetailCoreService,
  workoutDetailQueryService,
  workoutDetailSyncService
);

export const routineDetailService = new RoutineDetailService(
  exerciseService,
  routineService,
  routineDetailRepository,
  routineDetailAdapter,
  routineDetailApi
);

export const syncAllService = new SyncAllService(
  exerciseService,
  workoutService,
  routineService,
  workoutDetailService,
  routineDetailService,
  syncAllApi,
  syncAllAdapter
);
