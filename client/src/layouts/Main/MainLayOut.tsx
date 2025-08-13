import { ToasterComp } from '@components/common';
import Footer from '@layouts/Footer/Footer';
import Header from '@layouts/Header/Header';
import { Outlet } from 'react-router';

const MainLayOut = () => {
  return (
    <div className=" text-gray-800 dark:text-gray-200 min-h-screen">
      <ToasterComp />
      <Header />
      <div className="bg-transparent mt-7">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
// container mx-auto flex flex-col min-h-screen
export default MainLayOut;
