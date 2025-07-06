import pMap from "p-map";
import { prisma } from "@/lib/prisma";
import {
  localRoutineDetailSchema,
  localRoutineSchema,
  localWorkoutDetailSchema,
  localWorkoutSchema,
  nestedExerciseSchema,
} from "@/types/models";
import { validateData } from "@/util/validateData";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleServerError } from "@/app/api/_utils/handleError";

type PrismaTx = Prisma.TransactionClient;
const requestBodySchema = z.object({
  userId: z.string(),
  nestedExercises: z.array(nestedExerciseSchema),
  nestedWorkouts: z.array(
    localWorkoutSchema.extend({
      id: z.number(),
      details: z.array(localWorkoutDetailSchema.extend({ id: z.number() })),
    })
  ),
  nestedRoutines: z.array(
    localRoutineSchema.extend({
      id: z.number(),
      details: z.array(localRoutineDetailSchema.extend({ id: z.number() })),
    })
  ),
});
type RequestBody = z.infer<typeof requestBodySchema>;

const getDefaultExerciseMap = async (
  tx: PrismaTx
): Promise<Map<string, number>> => {
  const defaultExercises = await tx.exercise.findMany({
    where: {
      userId: null,
      isCustom: false,
    },
  });
  return new Map(defaultExercises.map((e) => [e.name, e.id]));
};

const clearUserData = async (tx: PrismaTx, userId: string) => {
  await tx.dailyExerciseMemo.deleteMany({
    where: { userExercise: { userId } },
  });
  await tx.fixedExerciseMemo.deleteMany({
    where: { userExercise: { userId } },
  });

  await tx.workoutDetail.deleteMany({
    where: { workout: { userId } },
  });
  await tx.routineDetail.deleteMany({
    where: { routine: { userId } },
  });
  await tx.userExercise.deleteMany({
    where: { userId },
  });

  await tx.exercise.deleteMany({
    where: { userId },
  });
  await tx.workout.deleteMany({
    where: { userId },
  });
  await tx.routine.deleteMany({
    where: { userId },
  });
};

const createUserExerciseData = (
  userExercise: NonNullable<RequestBody["nestedExercises"][0]["userExercise"]>,
  userId: string
) => ({
  userId,
  isBookmarked: userExercise.isBookmarked,
  unit: userExercise.unit,
  fixedExerciseMemo: userExercise.fixedMemo
    ? {
        create: {
          content: userExercise.fixedMemo.content,
          createdAt: new Date(userExercise.fixedMemo.createdAt),
          updatedAt: userExercise.fixedMemo.updatedAt
            ? new Date(userExercise.fixedMemo.updatedAt)
            : undefined,
        },
      }
    : undefined,
  dailyExerciseMemos: {
    create: userExercise.dailyMemos.map((memo) => ({
      date: new Date(memo.date),
      content: memo.content,
      createdAt: new Date(memo.createdAt),
      updatedAt: memo.updatedAt ? new Date(memo.updatedAt) : undefined,
    })),
  },
});

const createNestedPrismaExercises = async (
  tx: PrismaTx,
  userId: string,
  nestedExercises: RequestBody["nestedExercises"]
): Promise<Map<number, number>> => {
  const localIdToServerIdMap = new Map<number, number>();
  const defaultExerciseMap = await getDefaultExerciseMap(tx);

  for (const nestedExercise of nestedExercises) {
    const { userExercise, ...exercise } = nestedExercise;
    let exerciseServerId: number;

    if (exercise.isCustom) {
      const { name, category, imageUrl } = exercise;

      const createdExercise = await tx.exercise.create({
        data: {
          name,
          category,
          imageUrl,
          isCustom: true,
          userId,
          userExercises: userExercise
            ? { create: [createUserExerciseData(userExercise, userId)] }
            : undefined,
        },
      });
      exerciseServerId = createdExercise.id;
    } else {
      const serverId = defaultExerciseMap.get(exercise.name);
      if (!serverId) continue;
      exerciseServerId = serverId;

      if (userExercise) {
        await tx.userExercise.create({
          data: {
            exerciseId: exerciseServerId,
            ...createUserExerciseData(userExercise, userId),
          },
        });
      }
    }

    localIdToServerIdMap.set(exercise.id, exerciseServerId);
  }

  return localIdToServerIdMap;
};

const createNestedPrismaRoutines = async (
  tx: PrismaTx,
  userId: string,
  nestedRoutines: RequestBody["nestedRoutines"],
  localIdToServerIdMap: Map<number, number>
) => {
  for (const nestedRoutine of nestedRoutines) {
    const { details, ...routine } = nestedRoutine;

    await tx.routine.create({
      data: {
        name: routine.name,
        description: routine.description,
        userId,
        createdAt: new Date(routine.createdAt),
        updatedAt: routine.updatedAt ? new Date(routine.updatedAt) : undefined,
        routineDetails: {
          create: details
            .map((detail) => {
              const serverExerciseId = localIdToServerIdMap.get(
                detail.exerciseId
              );
              if (!serverExerciseId) return null;

              return {
                exerciseId: serverExerciseId,
                weight: detail.weight,
                reps: detail.reps,
                rpe: detail.rpe,
                exerciseOrder: detail.exerciseOrder,
                setOrder: detail.setOrder,
                setType: detail.setType,
                createdAt: new Date(detail.createdAt),
                updatedAt: detail.updatedAt
                  ? new Date(detail.updatedAt)
                  : undefined,
              };
            })
            .filter(
              (detail): detail is NonNullable<typeof detail> => detail !== null
            ),
        },
      },
    });
  }
};

const createNestedPrismaWorkouts = async (
  tx: PrismaTx,
  userId: string,
  nestedWorkouts: RequestBody["nestedWorkouts"],
  localIdToServerIdMap: Map<number, number>
) => {
  for (const nestedWorkout of nestedWorkouts) {
    const { details, ...workout } = nestedWorkout;

    await tx.workout.create({
      data: {
        date: new Date(workout.date),
        userId,
        status: workout.status,
        createdAt: new Date(workout.createdAt),
        updatedAt: workout.updatedAt ? new Date(workout.updatedAt) : undefined,
        workoutDetails: {
          create: details
            .map((detail) => {
              const serverExerciseId = localIdToServerIdMap.get(
                detail.exerciseId
              );
              if (!serverExerciseId) return null;

              return {
                exerciseId: serverExerciseId,
                isDone: detail.isDone,
                setOrder: detail.setOrder,
                setType: detail.setType,
                weight: detail.weight,
                rpe: detail.rpe,
                reps: detail.reps,
                exerciseOrder: detail.exerciseOrder,
                createdAt: new Date(detail.createdAt),
                updatedAt: detail.updatedAt
                  ? new Date(detail.updatedAt)
                  : undefined,
              };
            })
            .filter(
              (detail): detail is NonNullable<typeof detail> => detail !== null
            ),
        },
      },
    });
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = validateData<RequestBody>(requestBodySchema, body);
    const { userId, nestedExercises, nestedWorkouts, nestedRoutines } =
      parsedBody;
    await prisma.$transaction(
      async (tx) => {
        await clearUserData(tx, userId);

        const localIdToServerIdMap = await createNestedPrismaExercises(
          tx,
          userId,
          nestedExercises
        );

        await Promise.all([
          createNestedPrismaWorkouts(
            tx,
            userId,
            nestedWorkouts,
            localIdToServerIdMap
          ),
          createNestedPrismaRoutines(
            tx,
            userId,
            nestedRoutines,
            localIdToServerIdMap
          ),
        ]);
      },
      {
        maxWait: 20000,
        timeout: 30000,
      }
    );
    return NextResponse.json(
      { success: true },
      {
        status: 201,
      }
    );
  } catch (e) {
    return handleServerError(e);
  }
}
