import WorkoutCheckbox from "@/app/(main)/workout/_components/WorkoutCheckbox";

const WorkoutTableHeader = () => {
  return (
    <thead data-testid="workout-table-header">
      <tr className="h-[22px] text-center text-text-muted">
        <th className="w-[14%] ">Set</th>
        <th className="w-[38%]">Previous</th>
        <th className="w-[17%]">kg</th>
        <th className="w-[17%]">Reps</th>
        <th className="w-[14%]">
          <div className="flex justify-center items-center">
            <WorkoutCheckbox />
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default WorkoutTableHeader;
