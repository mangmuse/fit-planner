import { ClientExerise } from "@/types/models";
import clsx from "clsx";
import Image from "next/image";
import favoriteIcon from "public/favorite.svg";

type ExerciseItem = {
  exercise: ClientExerise;
  isSelected: boolean;
  onAdd: (newId: ClientExerise["id"]) => void;
  onDelete: (toBeDeleted: ClientExerise["id"]) => void;
};

const ExerciseItem = ({
  exercise,
  isSelected,
  onAdd,
  onDelete,
}: ExerciseItem) => {
  const handleClick = () =>
    isSelected ? onDelete(exercise.id) : onAdd(exercise.id);
  return (
    <li
      onClick={handleClick}
      className="px-3 flex justify-between w-full h-[51px] rounded-lg bg-bg-surface"
    >
      <div className="flex items-center gap-5">
        <div className="bg-slate-300 w-8 h-8">
          {/* <Image src={favoriteIcon} alt="운동 이미지" /> */}
        </div>
        <span className={clsx({ "text-primary": isSelected })}>
          {exercise.name}
        </span>
      </div>
      <Image src={favoriteIcon} alt="즐겨찾기" />
    </li>
  );
};

export default ExerciseItem;
