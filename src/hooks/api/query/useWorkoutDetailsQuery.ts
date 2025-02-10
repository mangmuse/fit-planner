import { getWorkoutDetails } from "@/api/workout.api";
import { QUERY_KEY } from "@/hooks/api/constants";
import { ClientWorkoutDetail } from "@/types/models";
import { useQuery } from "@tanstack/react-query";

const useWorkoutDetailsQuery = (
  userId: string | undefined,
  date: string,
  initialData: ClientWorkoutDetail[]
) => {
  return useQuery<ClientWorkoutDetail[], Error, ClientWorkoutDetail[]>({
    queryKey: [QUERY_KEY.WORKOUT_DETAILS, { userId, date }],
    queryFn: () => getWorkoutDetails(userId, date),
    enabled: !!userId,
    initialData,
  });
};

export default useWorkoutDetailsQuery;
