import Lottie from 'lottie-react';
import notFound from '@assets/lottie/notFound.json';
import error from '@assets/lottie/error.json';
import empty from '@assets/lottie/empty.json';
import loading from '@assets/lottie/SandyLoading.json';
import success from '@assets/lottie/success.json';
import working from '@assets/lottie/working.json';
const lottieFiles = {
  notFound: notFound,
  error: error,
  empty: empty,
  loading: loading,
  success,
  working,
};

type LottieHandlerProps = {
  type: keyof typeof lottieFiles;
  message?: string;
};

const LottieHandler = ({ type, message }: LottieHandlerProps) => {
  const loottie = lottieFiles[type];
  return (
    <div className="flex flex-col items-center mt-[15%]">
      <Lottie className="w-80" animationData={loottie} />
      {message && <h3 className="text-[20px] text-white">{message}</h3>}
    </div>
  );
};

export default LottieHandler;
