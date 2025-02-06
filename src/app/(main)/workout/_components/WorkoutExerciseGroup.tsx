import SetActions from "@/app/(main)/workout/_components/SetActions";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import WorkoutTableHeader from "@/app/(main)/workout/_components/WorkoutTableHeader";
import { PostWorkoutDetailInput } from "@/types/dto/workoutDetail.dto";
import { ClientWorkoutDetail } from "@/types/models";

type WorkoutExerciseGroupProps = {
  exerciseOrder: number;
  details: ClientWorkoutDetail[];
};

const WorkoutExerciseGroup = ({
  details,
  exerciseOrder,
}: WorkoutExerciseGroupProps) => {
  const lastValue = details[details.length - 1];
  const { exerciseId, workoutId, setOrder, id } = lastValue;
  const postWorkoutDetailInput: PostWorkoutDetailInput = {
    exerciseId,
    exerciseOrder,
    setOrder: setOrder + 1,
    workoutId,
  };

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
            <WorkoutItem key={detail.id} workoutDetail={detail} />
          ))}
        </tbody>
      </table>
      <SetActions
        postWorkoutDetailInput={postWorkoutDetailInput}
        workoutDetailId={id}
      />
    </div>
  );
};

export default WorkoutExerciseGroup;
