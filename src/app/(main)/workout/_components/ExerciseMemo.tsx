import { useModal } from "@/providers/contexts/ModalContext";
import { LocalExercise } from "@/types/models";

type ExerciseMemoProps = {
  exercise: LocalExercise;
};

const ExerciseMemo = ({ exercise }: ExerciseMemoProps) => {
  const { closeModal } = useModal();
  const handleUpdateMemo = () => {
    closeModal();
  };
  return (
    <div className="relative flex px-6 rounded-xl text-white flex-col item-center pt-5 bg-bg-surface-variant w-80 h-[350px]">
      <span className="text-center font-semibold"> {exercise.name}</span>
      <textarea
        placeholder="메모를 입력하세요"
        className="placeholder:opacity-50 text-xs p-3  bg-[#444444] mt-4 rounded-lg self-center w-full h-48 resize-none outline-none"
      ></textarea>
      <span className="text-[10px] opacity-50 mt-1">
        마지막 수정일 1900.01.01
      </span>
      <nav className="flex h-14 font-semibold w-full border-t-2 border-border-gray absolute right-0 left-0 bottom-0">
        <button
          onClick={closeModal}
          className="w-1/2 border-r-2 border-border-gray"
        >
          취소
        </button>
        <button onClick={handleUpdateMemo} className="w-1/2 text-primary">
          확인
        </button>
      </nav>
    </div>
  );
};

export default ExerciseMemo;
