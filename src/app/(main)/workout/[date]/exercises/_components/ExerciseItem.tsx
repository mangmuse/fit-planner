import { toggleLocalBookmark } from "@/services/exercise.service";
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
  onAdd: (newExercise: LocalExercise) => void;
  onDelete: (toBeDeleted: ClientExercise["id"]) => void;
  onReload: () => void;
};
const ExerciseItem = ({
  exercise,
  isSelected,
  onAdd,
  onDelete,
  onReload,
}: ExerciseItemProps) => {
  const { name, id, isBookmarked } = exercise;
  const { openModal } = useModal();
  const handleClick = () => {
    if (!exercise.id) return;
    return isSelected ? onDelete(exercise.id) : onAdd(exercise);
  };
  const handleToggleBookmark = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (!id) return;

    if (isBookmarked) {
      openModal({
        type: "confirm",
        title: "즐겨찾기에서 제거하시겠습니까?",
        message: name,
        onConfirm: async () => {
          await toggleLocalBookmark(id, false);
          onReload();
        },
      });
    } else {
      await toggleLocalBookmark(id, true);
      onReload();
    }
  };
  return (
    <li
      aria-labelledby="name"
      onClick={handleClick}
      className={clsx(
        "px-4 py-3 flex justify-between items-center w-full rounded-xl bg-bg-surface hover:bg-bg-surface-variant transition-all cursor-pointer",
        {
          "ring-2 ring-primary bg-bg-surface-variant": isSelected,
        }
      )}
    >
      <div className="flex items-center gap-3">
        <div className="bg-bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
          <span className="text-text-muted text-xs">GYM</span>
        </div>
        <span className={clsx("font-medium", { "text-primary": isSelected })}>
          {name}
        </span>
      </div>
      <button
        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        onClick={handleToggleBookmark}
      >
        <Image
          src={isBookmarked ? filledFavoriteIcon : favoriteIcon}
          alt={isBookmarked ? "북마크 해제" : "북마크"}
          width={20}
          height={20}
        />
      </button>
    </li>
  );
};

export default ExerciseItem;
