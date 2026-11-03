import { lazy, Suspense, useEffect, useState } from 'react';

// Each animation is loaded on demand, and so is the Lottie player itself. Before, all
// ~260 kB of animation JSON plus the player sat in the entry bundle.
const animations = {
  notFound: () => import('@assets/lottie/notFound.json'),
  error: () => import('@assets/lottie/error.json'),
  empty: () => import('@assets/lottie/empty.json'),
  loading: () => import('@assets/lottie/SandyLoading.json'),
  success: () => import('@assets/lottie/success.json'),
  working: () => import('@assets/lottie/working.json'),
};

const Lottie = lazy(() => import('lottie-react'));

type LottieHandlerProps = {
  type: keyof typeof animations;
  message?: string;
};

const LottieHandler = ({ type, message }: LottieHandlerProps) => {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    animations[type]().then((mod) => {
      if (!cancelled) setAnimationData(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <div className="mt-[15%] flex flex-col items-center px-4 text-center">
      <div className="h-80 w-80 max-w-full" aria-hidden="true">
        {animationData ? (
          <Suspense fallback={null}>
            <Lottie className="h-full w-full" animationData={animationData} />
          </Suspense>
        ) : null}
      </div>
      {message && (
        <h2 className="text-xl font-semibold text-white">{message}</h2>
      )}
    </div>
  );
};

export default LottieHandler;
