import TypeFilter from "@/app/(main)/workout/[date]/exercises/_components/TypeFilter";
import { CATEGORY_OPTIONS } from "@/constants/filters";
import { useModal } from "@/providers/contexts/ModalContext";
import { exerciseService } from "@/services/exercise.service";
import { trim } from "lodash";
import { useSession } from "next-auth/react";
import { useState } from "react";

type CustomExerciseFormProps = {
  reload: () => Promise<void>;
};

const CustomExerciseForm = ({ reload }: CustomExerciseFormProps) => {
  const userId = useSession()?.data?.user?.id;
  const { closeModal } = useModal();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const handleAddExercise = async () => {
    if (!trim(name) || !category || !userId) return;
    await exerciseService.addLocalExercise({
      userId,
      name,
      category,
    });
    await reload?.();
    closeModal();
  };
  return (
    <div className="bg-bg-surface-variant rounded-xl p-6 w-80">
      {/* 헤더 */}
      <h2 className="text-center text-white font-semibold text-lg mb-6">
        커스텀 운동 추가
      </h2>

      {/* 운동 이름 입력 */}
      <div className="mb-5">
        <label className="text-white text-sm mb-2 block opacity-90">
          운동 이름 *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 덤벨 컬"
          className="w-full px-4 py-3 bg-bg-surface rounded-lg text-white
                       placeholder:opacity-50 outline-none focus:ring-2
                       focus:ring-primary/50 transition-all"
        />
      </div>

      {/* 카테고리 선택 */}
      <div className="mb-8">
        <label className="text-white text-sm mb-2 block opacity-90">
          카테고리 *
        </label>

        <select
          className="w-full px-4 py-3 bg-bg-surface rounded-lg text-white
                            outline-none focus:ring-2 focus:ring-primary/50
                            transition-all cursor-pointer"
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={closeModal}
          className="flex-1 py-3 rounded-lg bg-gray-200 text-black
                            font-medium hover:bg-opacity-80 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleAddExercise}
          disabled={!trim(name)}
          className="flex-1 py-3 rounded-lg bg-primary text-white
                            font-medium hover:bg-opacity-90 transition-colors
                            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </div>
    </div>
  );
};

export default CustomExerciseForm;
