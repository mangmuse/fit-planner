import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalRoutine } from "@/types/models";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RoutineItemProps = {
  routine: LocalRoutine;
  onPick?: (routineId: number) => Promise<void>;
};

const RoutineItem = ({ routine, onPick }: RoutineItemProps) => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { closeBottomSheet } = useBottomSheet();
  const confirmPickRoutine = async () => {
    if (onPick) {
      closeBottomSheet();
      openModal({
        title: "루틴 선택",
        type: "confirm",
        message: `${routine.name} 루틴을 선택하시겠습니까?`,
        onConfirm: async () => {
          await onPick(Number(routine.id));
        },
        onCancel: () => {
          closeModal();
        },
      });
    }
  };

  const handleClick = async () => {
    if (onPick) {
      await confirmPickRoutine();
    } else {
      router.push(`/routines/${routine.id}`);
    }
  };
  return (
    <button onClick={handleClick}>
      <li className="p-2 w-full h-20 bg-bg-surface rounded-xl">
        <p>{routine.name}</p>
      </li>
    </button>
  );
};

export default RoutineItem;
