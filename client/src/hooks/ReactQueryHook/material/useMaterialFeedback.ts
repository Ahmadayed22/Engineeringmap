import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Material } from '@customTypes/Material';
import { AxiosErrorHandler } from '@util/index';
import { translateServerMessage } from '@i18n/serverMessages';

type VoteResponse = { resourceId: number; score: number; myVote: number };

/** Up/down votes and "report this material", with optimistic score updates. */
const useMaterialFeedback = (courseId: unknown) => {
  const queryClient = useQueryClient();
  const key = ['resource', courseId];

  const vote = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: -1 | 0 | 1 }) =>
      (await axios.post<VoteResponse>(`/api/resource/${id}/vote`, { value }))
        .data,
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Material[]>(key);
      queryClient.setQueryData<Material[]>(key, (old) =>
        old?.map((m) =>
          m.id === id
            ? {
                ...m,
                score: (m.score ?? 0) - (m.myVote ?? 0) + value,
                myVote: value,
              }
            : m
        )
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(AxiosErrorHandler(error));
    },
    onSuccess: (res) => {
      queryClient.setQueryData<Material[]>(key, (old) =>
        old?.map((m) =>
          m.id === res.resourceId
            ? { ...m, score: res.score, myVote: res.myVote }
            : m
        )
      );
    },
  });

  const report = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) =>
      (
        await axios.post<{ message: string }>(`/api/resource/${id}/report`, {
          reason,
        })
      ).data,
    onSuccess: (res) => toast.success(translateServerMessage(res.message)),
    onError: (error) => toast.error(AxiosErrorHandler(error)),
  });

  return { vote, report };
};

export default useMaterialFeedback;
