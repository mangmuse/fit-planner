type WorkoutCheckboxProps = {
  isDone: boolean;
};

const WorkoutCheckbox = ({ isDone }: WorkoutCheckboxProps) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={isDone} />
      <div className="flex w-[14px] h-[14px] rounded-full border-[2px] border-text-muted peer-checked:bg-primary peer-checked:border-none" />
    </label>
  );
};

export default WorkoutCheckbox;
