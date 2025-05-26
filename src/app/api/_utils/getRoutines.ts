import { prisma } from "@/lib/prisma";

export const getRoutines = async (userId: string) => {
  const routines = await prisma.routine.findMany({ where: { userId } });
  return routines;
};
