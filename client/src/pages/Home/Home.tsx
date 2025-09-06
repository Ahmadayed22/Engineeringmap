import { Link } from 'react-router';

import cpe from '../../../public/cpe.webp';
import EE from '../../../public/EE.webp';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10">
        اختر الخطة المطلوبة
      </h1>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        {/* Computer Engineering */}
        <Link to="/computerEngineer" className="flex justify-center">
          <div className="flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition duration-300">
            <img
              src={cpe}
              alt="Computer Engineering"
              className="w-full h-full  mb-4 transition-transform group-hover:scale-110 rounded-2xl"
            />
          </div>
        </Link>

        {/* Electrical Engineering */}
        <Link to="/electricalEngineer" className="flex justify-center">
          <div className="flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition duration-300">
            <img
              src={EE}
              alt="Electrical Engineering"
              className="w-full h-full  mb-4 transition-transform group-hover:scale-110 rounded-2xl"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
