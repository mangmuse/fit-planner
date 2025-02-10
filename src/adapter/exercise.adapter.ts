import { db } from "@/lib/db";
import { ClientExercise, LocalExercise } from "@/types/models";

export async function mergeServerExerciseData(
  serverData: ClientExercise[]
): Promise<LocalExercise[]> {
  const localAll = await db.exercises.toArray();

  const serverMapped = serverData.map((s) => ({
    ...s,
    serverId: s.id,
    isSynced: true,
    updatedAt: new Date().toISOString(),
  }));
  const merged: LocalExercise[] = [];

  for (const localExercise of localAll) {
    if (!localExercise.serverId) {
      merged.push(localExercise);
    }
  }

  for (const serverExercise of serverMapped) {
    const localMatch = localAll.find(
      (local) => local.serverId === serverExercise.serverId
    );
    if (!localMatch) {
      merged.push({
        ...serverExercise,
      });
    } else {
      if (localMatch.isSynced === false) {
        merged.push(localMatch);
      } else {
        merged.push({
          ...localMatch,
          ...serverExercise,
          id: localMatch.id,
        });
      }
    }
  }

  return merged;
}
