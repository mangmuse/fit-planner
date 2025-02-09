import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { ClientWorkoutDetail, LocalWorkoutDetail } from "@/types/models";

type WorkoutItemProps = {
  workoutDetail: LocalWorkoutDetail;
};

const WorkoutItem = ({ workoutDetail }: WorkoutItemProps) => {
  const { setOrder, weight, reps, isDone } = workoutDetail;
  // 예시로 previous 값이 없다면 빈 값을 표시합니다.
  // 'O' 컬럼은 isDone 여부로 표시하는 예시입니다.
  return (
    <tr className="h-[22px]">
      <td className="text-center">{setOrder}</td>
      <td className="text-center">-</td>
      <td className="text-center">
        <input className="w-[30px] rounded-sm h-3 resize-none bg-transparent outline outline-text-muted" />
      </td>
      <td className="text-center">
        <input className="w-[30px] rounded-sm h-3 resize-none bg-transparent outline outline- outline-text-muted" />
      </td>
      <td className="text-center  ">
        <div className="flex justify-center items-center">
          <WorkoutCheckbox isDone={isDone} />
        </div>
      </td>
    </tr>
  );
};

export default WorkoutItem;
