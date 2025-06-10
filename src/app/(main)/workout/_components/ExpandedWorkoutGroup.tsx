import ExpandedWorkoutItem from "@/app/(main)/workout/_components/ExpandedWorkoutItem";
import { getExerciseWithLocalId } from "@/services/exercise.service";
import { LocalWorkoutDetail } from "@/types/models";
import { useEffect, useState } from "react";

type ExpanedWorkoutGroupProps = {
  workoutGroup: {
    exerciseOrder: number;
    details: LocalWorkoutDetail[];
  };
  isSelected: boolean;

  onToggleSelect: (workoutId: number, exerciseOrder: number) => void;
};

const ExpandedWorkoutGroup = ({
  workoutGroup,
  isSelected,
  onToggleSelect,
}: ExpanedWorkoutGroupProps) => {
  const exerciseName = workoutGroup.details[0].exerciseName;
  const [exerciseUnit, setExerciseUnit] = useState<"kg" | "lbs">("kg");

  const handleToggleSelect = () => {
    const workoutId = workoutGroup.details[0].workoutId;
    const exerciseOrder = workoutGroup.exerciseOrder;
    onToggleSelect(workoutId, exerciseOrder);
  };

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
