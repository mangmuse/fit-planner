import RoutineList from "@/app/(main)/routines/_components/RoutineList";
import Image from "next/image";
import addBtn from "public/add.svg";

const RoutineContainer = () => {
  return (
    <>
      <Image src={addBtn} alt="루틴 추가" />
      <RoutineList />
    </>
  );
};

export default RoutineContainer;
