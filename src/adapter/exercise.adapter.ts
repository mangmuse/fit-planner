import { ClientExercise, LocalExercise } from "@/types/models";

export const exerciseAdapter = {
  mergeServerExerciseData(
    serverData: ClientExercise[],
    localData: LocalExercise[]
  ): LocalExercise[] {
    const serverMapped = serverData.map((s) => ({
      ...s,
      serverId: s.id,
      isSynced: true,
      updatedAt: new Date().toISOString(),
    }));
    const merged: LocalExercise[] = [];

    for (const localExercise of localData) {
      if (!localExercise.serverId) {
        merged.push(localExercise);
      }
    }

    for (const serverExercise of serverMapped) {
      const localMatch = localData.find(
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
  },
};
