import Image from "next/image";
import ExerciseList from "./_components/ExerciseList";
import SearchBar from "./_components/SearchBar";
import addButton from "public/add.svg";
import ExerciseFilter from "./_components/ExerciseFilter";

const ExercisesPage = () => {
  return (
    <>
      <div className="flex justify-end mt-[53px] mb-3">
        <Image src={addButton} alt="추가하기" />
      </div>
      <SearchBar />
      <ExerciseFilter />
      <ExerciseList />
    </>
  );
};

export default ExercisesPage;
