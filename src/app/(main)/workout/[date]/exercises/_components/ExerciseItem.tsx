import useExerciseMutation from "@/hooks/api/mutation/useExerciseMutation";
import { toggleLocalBookmark } from "@/lib/localExerciseService";
import { useModal } from "@/providers/contexts/ModalContext";
import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";
import clsx from "clsx";
import Image from "next/image";
import favoriteIcon from "public/favorite.svg";
import filledFavoriteIcon from "public/favorite_filled.svg";
import { useState } from "react";

type ExerciseItemProps = {
  exercise: LocalExercise;
  isSelected: boolean;
  onAdd: (newId: ClientExercise["id"]) => void;
  onDelete: (toBeDeleted: ClientExercise["id"]) => void;
  onReload: () => void;
  userId: ClientUser["id"];
};
const ExerciseItem = ({
  exercise,
  isSelected,
  onAdd,
  onDelete,
  onReload,
  userId,
}: ExerciseItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { name, id, isBookmarked } = exercise;
  const { openModal } = useModal();
  const { updateBookmark } = useExerciseMutation();
  const handleClick = () => {
    if (!exercise.id) return;
    return isSelected ? onDelete(exercise.id) : onAdd(exercise.id);
  };

  const handleToggleBookmark = async (
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    e.stopPropagation();
    if (isUpdating || !id) return;
    setIsUpdating(true);

    if (isBookmarked) {
      openModal({
        type: "confirm",
        title: "즐겨찾기에서 제거하시겠습니까?",
        message: name,
        onCancel: () => setIsUpdating(false),
        onConfirm: async () => {
          await toggleLocalBookmark(id, false);
          onReload();
          setIsUpdating(false);
        },
      });
    } else {
      await toggleLocalBookmark(id, true);
      onReload();
      setIsUpdating(false);
    }
  };
  return (
    <li
      onClick={handleClick}
      data-name={name}
      data-bookmark={isBookmarked}
      className="px-3 flex justify-between w-full h-[51px] rounded-lg bg-bg-surface"
    >
      <div className="flex items-center gap-5">
        <div className="bg-slate-300 w-8 h-8">
          {/* <Image src={favoriteIcon} alt="운동 이미지" /> */}
        </div>
        <span className={clsx({ "text-primary": isSelected })}>{name}</span>
      </div>
      <div
        role="button"
        data-testid="bookmark-toggle"
        className="self-center"
        onClick={handleToggleBookmark}
      >
        <Image
          src={isBookmarked ? filledFavoriteIcon : favoriteIcon}
          alt={isBookmarked ? "북마크 해제" : "북마크"}
        />
      </div>
    </li>
  );
};

export default ExerciseItem;
