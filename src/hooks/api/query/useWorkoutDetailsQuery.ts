import { getWorkoutDetails } from "@/api/workout";
import { ClientWorkoutDetail } from "@/types/models";
import { useQuery } from "@tanstack/react-query";

const useWorkoutDetailsQuery = (
  userId: string,
  date: string,
  initialData: ClientWorkoutDetail[]
) => {
  return useQuery<ClientWorkoutDetail[], Error, ClientWorkoutDetail>({
    queryKey: ["workoutDetails", { userId, date }],
    queryFn: () => getWorkoutDetails(userId, date),
    initialData,
  });
};

export default useWorkoutDetailsQuery;
