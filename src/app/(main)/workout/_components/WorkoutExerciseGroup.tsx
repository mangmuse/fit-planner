import SetActions from "@/app/(main)/workout/_components/SetActions";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import WorkoutTableHeader from "@/app/(main)/workout/_components/WorkoutTableHeader";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";

type WorkoutExerciseGroupProps = {
  exerciseOrder: number;
  details: LocalWorkoutDetail[];
  loadLocalWorkoutDetails: () => Promise<void>;
};

const WorkoutExerciseGroup = ({
  details,
  exerciseOrder,
  loadLocalWorkoutDetails,
}: WorkoutExerciseGroupProps) => {
  const lastValue = details[details.length - 1];

  return (
    <div className="bg-bg-surface  font-semibold pb-2.5">
      <h6 className="flex gap-1 text-xs px-1 h-5 items-center">
        <span>{exerciseOrder}</span>
        <span className="text-primary">{details[0].exerciseName}</span>
      </h6>
      <table className="w-full text-[10px]">
        <WorkoutTableHeader />
        <tbody>
          {details.map((detail) => (
            <WorkoutItem
              key={detail.id}
              loadLocalWorkoutDetails={loadLocalWorkoutDetails}
              workoutDetail={detail}
            />
          ))}
        </tbody>
      </table>
      <SetActions
        loadLocalWorkoutDetails={loadLocalWorkoutDetails}
        lastValue={lastValue}
      />
    </div>
  );
};

export default WorkoutExerciseGroup;
