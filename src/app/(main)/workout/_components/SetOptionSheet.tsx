import RPESelector from "@/app/(main)/workout/_components/RPESelector";
import SetTypeSelector from "@/app/(main)/workout/_components/SetTypeList";

const SetOptionSheet = () => {
  return (
    <div className="flex flex-col">
      <h3 className="font-semibold ">세트 타입</h3>
      <SetTypeSelector />

      <h3 className="font-semibold mt-3">RPE</h3>
      <RPESelector />
    </div>
  );
};

export default SetOptionSheet;
