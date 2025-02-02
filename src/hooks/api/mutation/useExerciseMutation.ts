import { patchBookmark } from "@/api/exercise";
import { QUERY_KEY } from "@/hooks/api/constants";
import { UpdateBookmarkInput } from "@/types/dto/exercise.dto";
import { ClientExerise } from "@/types/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useExerciseMutation() {
  const queryClient = useQueryClient();

  const { mutate: updateBookmark } = useMutation({
    mutationFn: async ({
      userId,
      exerciseId,
      isBookmarked,
    }: UpdateBookmarkInput) => {
      return patchBookmark({ userId, exerciseId, isBookmarked });
    },

    onMutate: async (variables) => {
      const {
        exerciseId,
        isBookmarked,
        keyword,
        exerciseType,
        category,
        userId,
      } = variables;

      await queryClient.cancelQueries({
        queryKey: [QUERY_KEY.EXERCISES, keyword, exerciseType, category],
      });

      const prevData = queryClient.getQueryData<ClientExerise[]>([
        QUERY_KEY.EXERCISES,
        userId,
        keyword,
        exerciseType,
        category,
      ]);

      if (prevData) {
        const newData = prevData.map((item) => {
          if (item.id === exerciseId) {
            return { ...item, isBookmarked: !isBookmarked };
          }
          return item;
        });
        queryClient.setQueryData(
          [QUERY_KEY.EXERCISES, userId, keyword, exerciseType, category],
          newData
        );
      }

      return { prevData };
    },

    onError: (error, variables, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(
          [
            QUERY_KEY.EXERCISES,
            variables.userId,
            variables.keyword,
            variables.exerciseType,
            variables.category,
          ],
          context.prevData
        );
      }
    },

    onSuccess: (data, variables) => {
      if (data.success && data.exercise) {
        queryClient.setQueryData<ClientExerise[]>(
          [
            QUERY_KEY.EXERCISES,
            variables.userId,
            variables.keyword,
            variables.exerciseType,
            variables.category,
          ],
          (oldList) => {
            if (!oldList) return oldList;
            return oldList.map((item) =>
              item.id === data.exercise.id ? data.exercise : item
            );
          }
        );
      }
    },
  });

  return { updateBookmark };
}
