import SetActions from "@/app/(main)/workout/_components/SetActions";
import WorkoutDetailGroupOptions from "@/app/(main)/workout/_components/WorkoutDetailGroupOptions";
import WorkoutItem from "@/app/(main)/workout/_components/WorkoutItem";
import WorkoutTableHeader from "@/app/(main)/workout/_components/WorkoutTableHeader";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";
import Image from "next/image";
import menuIcon from "public/meatball.svg";

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
  const { openBottomSheet } = useBottomSheet();
  const lastValue = details[details.length - 1];

  return (
    <div className="bg-bg-surface font-semibold pb-2.5">
      <div className="flex relative text-xs px-1 h-5 items-center justify-between">
        <h6 className="flex gap-1">
          <span data-testid="exercise-order">{exerciseOrder}</span>
          <span className="text-primary">{details[0].exerciseName}</span>
        </h6>
        <button
          onClick={() => {
            openBottomSheet({
              height: 300,
              children: (
                <WorkoutDetailGroupOptions
                  exerciseName={details[0].exerciseName}
                />
              ),
            });
          }}
          className="cursor-pointer absolute top-[0.5px] right-2.5"
        >
          <Image src={menuIcon} alt="운동 메뉴" />
        </button>
      </div>
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
