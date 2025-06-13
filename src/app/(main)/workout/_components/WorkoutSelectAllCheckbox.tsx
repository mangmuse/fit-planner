import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { useState } from "react";
import Image from "next/image";
import checkIcon from "public/check.svg";
import { useModal } from "@/providers/contexts/ModalContext";

export type WorkoutSelectAllCheckBoxProps = {
  handleClickCheckbox: () => Promise<void>;
  allDone?: boolean;
  setAllDone: (value: boolean) => void;
  id?: number;
  reload: () => Promise<void>;
};

const WorkoutSelectAllCheckbox = ({
  allDone,
  handleClickCheckbox,
  reload,
  setAllDone,
}: WorkoutSelectAllCheckBoxProps) => {
  const { openModal } = useModal();
  const openDeleteModal = () =>
    openModal({
      type: "confirm",
      title: "Workout Completed",
      message: "You have completed this workout.",
      onConfirm: handleClickCheckbox,
    });

  const handleChange = async () => {
    console.log("dqwdqw");
    const newValue = !allDone;
  };
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        onChange={openDeleteModal}
        type="checkbox"
        checked={allDone}
        className="sr-only peer"
      />
      <div className="relative flex items-center justify-center w-[16px] h-[16px] rounded border-[1.5px] border-text-muted peer-checked:bg-primary peer-checked:border-primary transition-all duration-200">
        {allDone && (
          <Image
            src={checkIcon}
            alt="완료"
            width={10}
            height={10}
            className="absolute"
          />
        )}
      </div>
    </label>
  );
};

export default WorkoutSelectAllCheckbox;
