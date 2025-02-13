import { prisma } from "@/lib/prisma";

export const getWorkouts = async (userId: string) => {
  const workouts = await prisma.workout.findMany({ where: { userId } });

  return workouts;
};
export const getWorkoutIds = async (userId: string): Promise<string[]> => {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    select: { id: true },
  });
  const workoutIds = workouts.map((w) => w.id);

  return workoutIds;
};
