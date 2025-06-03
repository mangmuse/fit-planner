import { useSelectedWokroutDetails } from "@/__mocks__/src/store/useSelectedWorkoutDetails";
import ExpandedWorkoutItem from "@/app/(main)/workout/_components/ExpandedWorkoutItem";
import { WorkoutGroup } from "@/hooks/useLoadDetails";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import { on } from "events";
import { useEffect, useState } from "react";

type ExpanedWorkoutGroupProps = {
  workoutGroup: WorkoutGroup;
  isSelected: boolean;

  onToggleSelect: (exerciseOrder: number) => void;
};

const ExpandedWorkoutGroup = ({
  workoutGroup,
  isSelected,
  onToggleSelect,
}: ExpanedWorkoutGroupProps) => {
  const exerciseName = workoutGroup.details[0].exerciseName;
  const [exerciseUnit, setExerciseUnit] = useState<"kg" | "lbs">("kg");

  const handleToggleSelect = () =>
    workoutGroup.details.forEach((detail) => {
      if (!detail.id) throw new Error("detail id가 없어요");
      onToggleSelect(detail.id);
    });

  useEffect(() => {
    (async () => {
      const exercise = await getExerciseWithLocalId(
        workoutGroup.details[0].exerciseId
      );
      setExerciseUnit(exercise.unit);
    })();
  }, [workoutGroup]);
  return (
    <div>
      <div className="flex gap-1">
        <input
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={handleToggleSelect}
          type="checkbox"
          className="peer"
        />
        <h1>{exerciseName}</h1>
        <ul>
          {workoutGroup.details.length > 0 &&
            workoutGroup.details.map((detail) => (
              <ExpandedWorkoutItem
                key={detail.id}
                workoutDetail={detail}
                exerciseUnit={exerciseUnit}
              />
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ExpandedWorkoutGroup;
