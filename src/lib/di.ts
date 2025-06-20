import {
  ExerciseAdapter,
  ExerciseAdapter as exerciseAdapterObj,
} from "@/adapter/exercise.adapter";
import {
  RoutineDetailAdapter,
  routineDetailAdapter as routineDetailAdapterObj,
} from "@/adapter/routineDetail.adapter";
import {
  WorkoutdetailAdapter,
  workoutDetailAdapter as workoutDetailAdapterObj,
} from "@/adapter/workoutDetail.adapter";
import { WorkoutApi } from "@/api/workout.api";
import { WorkoutDetailApi } from "@/api/workoutDetail.api";
// import { exerciseApi as exerciseApiObj } from "@/api/exercise.api";
// import { routineApi as routineApiObj } from "@/api/routine.api";
// import { routineDetailApi as routineDetailApiObj } from "@/api/routineDetail.api";
import { exerciseRepository as exerciseRepositoryObj } from "@/repositories/exercise.repository";
import { routineRepository as routineRepositoryObj } from "@/repositories/routine.repository";
import { routineDetailRepository as routineDetailRepositoryObj } from "@/repositories/routineDetail.repository";
import { workoutRepository as workoutRepositoryObj } from "@/repositories/workout.repository";
import { workoutDetailRepository as workoutDetailRepositoryObj } from "@/repositories/workoutDetail.repository";
import { exerciseService as exerciseServiceObj } from "@/services/exercise.service";
import { routineService as routineServiceObj } from "@/services/routine.service";
import { routineDetailService as routineDetailServiceObj } from "@/services/routineDetail.service";
import { WorkoutService } from "@/services/workout.service";
import { WorkoutDetailCoreService } from "@/services/workoutDetail.core.service";
import { WorkoutDetailQueryService } from "@/services/workoutDetail.query.service";
import { WorkoutDetailSyncService } from "@/services/workoutDetail.sync.service";
import {
  IWorkoutDetailCoreService,
  IWorkoutDetailQueryService,
  IWorkoutDetailService,
  IWorkoutDetailSyncService,
} from "@/types/services";

// ------ API ----- //
// export const exerciseApi = exerciseApiObj;
// export const routineApi = routineApiObj;
// export const routineDetailApi = routineDetailApiObj;
export const workoutApi = new WorkoutApi();
export const workoutDetailApi = new WorkoutDetailApi();

// ------ Repository ----- //
export const exerciseRepository = exerciseRepositoryObj;
export const routineRepository = routineRepositoryObj;
export const routineDetailRepository = routineDetailRepositoryObj;
export const workoutRepository = workoutRepositoryObj;
export const workoutDetailRepository = workoutDetailRepositoryObj;

// ------ Adapter ----- //
export const exerciseAdapter = new ExerciseAdapter();

export const workoutDetailAdapter = new WorkoutdetailAdapter();
export const routineDetailAdapter = new RoutineDetailAdapter();

// ----- Service ----- //

export const exerciseService = exerciseServiceObj;

export const workoutService = new WorkoutService(workoutRepository, workoutApi);
export const routineService = routineServiceObj;

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

export const workoutDetailService: IWorkoutDetailService = Object.assign(
  {},
  workoutDetailCoreService,
  workoutDetailSyncService,
  workoutDetailQueryService
);
export const routineDetailService = routineDetailServiceObj;
