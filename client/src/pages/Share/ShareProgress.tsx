import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosErrorHandler } from '@util/index';
import { useI18n } from '@i18n/context';

/** Owner side: turn the public progress link on or off and copy it. */
const ShareProgress = () => {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['shareLink'],
    queryFn: async () =>
      (await axios.get<{ token: string | null }>('/api/users/me/share')).data
        .token,
  });

  const enable = useMutation({
    mutationFn: async () =>
      (await axios.post<{ token: string }>('/api/users/me/share')).data.token,
    onSuccess: (token) => queryClient.setQueryData(['shareLink'], token),
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });
  const disable = useMutation({
    mutationFn: () => axios.delete('/api/users/me/share'),
    onSuccess: () => {
      queryClient.setQueryData(['shareLink'], null);
      toast.success(t('share.turnedOff'));
    },
    onError: (e) => toast.error(AxiosErrorHandler(e)),
  });

  const url = data ? `${window.location.origin}/progress/${data}` : null;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('share.copied'));
    } catch {
      toast.error(t('share.copyFailed'));
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 pb-16">
      <section className="rounded-2xl border border-white/10 bg-neutral-950/75 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">{t('share.title')}</h1>
        <p className="mt-2 text-sm text-white/70">{t('share.body')}</p>

        {isLoading ? (
          <p className="mt-6 text-white/60">Loading…</p>
        ) : url ? (
          <div className="mt-6 space-y-3">
            <label htmlFor="share-url" className="text-xs text-white/50">
              {t('share.yourLink')}
            </label>
            <div className="flex gap-2">
              <input
                id="share-url"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={copy}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {t('common.copy')}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:underline"
              >
                {t('share.preview')}
              </a>
              <button
                type="button"
                onClick={() => disable.mutate()}
                disabled={disable.isPending}
                className="cursor-pointer text-sm text-red-400 hover:underline"
              >
                {t('share.turnOff')}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => enable.mutate()}
            disabled={enable.isPending}
            className="mt-6 cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {enable.isPending ? t('share.creating') : t('share.create')}
          </button>
        )}
      </section>
    </main>
  );
};

export default ShareProgress;
