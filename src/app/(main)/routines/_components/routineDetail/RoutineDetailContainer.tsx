"use client";
import SessionPlaceholder from "@/app/(main)/_shared/session/SessionPlaceholder";
import { TEMP_ROUTINE_ID } from "@/app/(main)/routines/constants";

import { routineDetailService } from "@/lib/di";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type RoutineDetailContainerProps = {
  prevData?: [];
  reload?: () => Promise<void>;
};

const RoutineDetailContainer = ({
  prevData,
  reload,
}: RoutineDetailContainerProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { routineId } = useParams();
  const getDetails = async () => {
    const id = routineId ?? TEMP_ROUTINE_ID;
    const good = await routineDetailService.getLocalRoutineDetails(Number(id));
  };

  useEffect(() => {
    // reload();
    getDetails();
  }, []);
  return (
    <>{prevData ? <div>hello</div> : <SessionPlaceholder type="ROUTINE" />}</>
  );
};

export default RoutineDetailContainer;
