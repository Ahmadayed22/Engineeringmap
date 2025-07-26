import Footer from '@layouts/Footer/Footer';
import Header from '@layouts/Header/Header';
import { Outlet } from 'react-router';

const MainLayOut = () => {
  return (
    <div className="bg-gray-100 dark:bg-[#212121] text-gray-800 dark:text-gray-200">
      <div className="container mx-auto flex flex-col min-h-screen">
        <Header />
        <div className="mt-7">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayOut;
