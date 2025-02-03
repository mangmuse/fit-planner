import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  const { userId, selectedExercises, date } = await req.json();

  const startOfDay = dayjs(date).startOf("day").toDate();
  const endOfDay = dayjs(date).endOf("day").toDate();

  let workout = await prisma.workout.findFirst({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  let startOrder = 1;

  if (!workout) {
    workout = await prisma.workout.create({
      data: { userId, date },
    });
  } else {
    const lastDetail = await prisma.workoutDetail.findFirst({
      where: { workoutId: workout.id },
      orderBy: { exerciseOrder: "desc" },
    });
    startOrder = lastDetail ? lastDetail.exerciseOrder + 1 : 1;
  }

  const details = selectedExercises.map(
    (exerciseId: number, index: number) => ({
      workoutId: workout.id,
      exerciseId,
      exerciseOrder: startOrder + index,
      setOrder: 1,
    })
  );

  await prisma.workoutDetail.createMany({
    data: details,
  });

  return Response.json({ success: true });
}
