import { useI18n } from '../../../i18n/context';

type PageLoaderProps = {
  message?: string;
};

/**
 * Lightweight loading state (pure CSS). Used as the route-level Suspense fallback, which
 * must render before any lazy chunk arrives, so it can't depend on Lottie.
 */
const PageLoader = ({ message }: PageLoaderProps) => {
  const { t } = useI18n();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white motion-reduce:animate-none" />
      <span className="text-sm text-white/80">
        {message ?? t('common.loading')}
      </span>
    </div>
  );
};

export default PageLoader;
