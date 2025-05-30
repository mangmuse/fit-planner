import { prisma } from "@/lib/prisma";

export const getRoutines = async (userId: string) => {
  const routines = await prisma.routine.findMany({ where: { userId } });
  return routines;
};

export const getRoutineIds = async (userId: string): Promise<string[]> => {
  const routines = await prisma.routine.findMany({
    where: { userId },
    select: { id: true },
  });
  const routineIds = routines.map((r) => r.id);
  return routineIds;
};
