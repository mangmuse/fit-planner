import ExpandedWorkoutItem from "@/app/(main)/workout/_components/ExpandedWorkoutItem";
import { exerciseService } from "@/services/exercise.service";
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
      const exercise = await exerciseService.getExerciseWithLocalId(
        workoutGroup.details[0].exerciseId
      );
      if (exercise) {
        setExerciseUnit(exercise.unit);
      }
    })();
  }, [workoutGroup]);
  return (
    <div className="bg-bg-secondary rounded-lg p-3">
      <div className="flex items-start gap-3">
        <input
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={handleToggleSelect}
          type="checkbox"
          className="mt-1 w-5 h-5 rounded border-2 border-text-muted checked:bg-primary checked:border-primary focus:outline-none"
        />
        <div className="flex-1">
          <h3 className="font-medium text-base mb-2">{exerciseName}</h3>
          <ul className="flex flex-col gap-1">
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
    </div>
  );
};

export default ExpandedWorkoutGroup;
