import { db } from "@/lib/db";
import { LocalWorkout } from "@/types/models";

export const workoutRepository = {
  async findOneById(workoutId: number): Promise<LocalWorkout> {
    return db.workouts.get(workoutId);
  },
};
