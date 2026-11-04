import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useI18n, type I18n } from '@i18n/context';

type NotificationItem = {
  id: number;
  type: string;
  message: string;
  courseId: number | null;
  commentId: number | null;
  read: boolean;
  createdAt: string;
};

const timeAgo = (iso: string, t: I18n['t'], locale: string) => {
  const s = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  );
  if (s < 60) return t('time.now');
  const m = Math.round(s / 60);
  if (m < 60) return t('time.min', { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('time.hour', { n: h });
  return new Date(iso).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};

/** Header bell: unread count (checked every minute) and the latest notifications. */
const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  // The server phrases reply notifications in English; show them in the UI language.
  const describe = (n: NotificationItem) => {
    const m = /^(.*) replied to your comment$/.exec(n.message);
    return n.type === 'COMMENT_REPLY' && m
      ? t('notif.reply', { name: m[1] })
      : n.message;
  };

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () =>
      (await axios.get<{ count: number }>('/api/notifications/unread-count'))
        .data.count,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () =>
      (await axios.get<NotificationItem[]>('/api/notifications')).data,
    enabled: isAuthenticated && open,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  const readAll = useMutation({
    mutationFn: () => axios.post('/api/notifications/read-all'),
    onSuccess: refresh,
  });
  const readOne = useMutation({
    mutationFn: (id: number) => axios.post(`/api/notifications/${id}/read`),
    onSuccess: refresh,
  });

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated) return null;
  const count = unread ?? 0;

  const openItem = (n: NotificationItem) => {
    if (!n.read) readOne.mutate(n.id);
    setOpen(false);
    if (n.courseId) navigate(`/course/${n.courseId}`);
  };

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={count ? t('notif.unread', { n: count }) : t('notif.title')}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
      >
        <IoNotificationsOutline className="text-xl" aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-sm font-semibold text-white">
              {t('notif.title')}
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => readAll.mutate()}
                className="cursor-pointer text-xs text-blue-400 hover:underline"
              >
                {t('notif.markAll')}
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <li className="px-4 py-6 text-center text-sm text-white/50">
                {t('common.loading')}
              </li>
            ) : !items || items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-white/50">
                {t('notif.empty')}
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-text-start transition hover:bg-white/5 ${
                      n.read ? '' : 'bg-blue-500/5'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-blue-500'}`}
                    />
                    <span className="flex flex-col">
                      <span
                        className={`text-sm ${n.read ? 'text-white/70' : 'text-white'}`}
                      >
                        {describe(n)}
                      </span>
                      <span className="text-xs text-white/40">
                        {timeAgo(n.createdAt, t, locale)}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
