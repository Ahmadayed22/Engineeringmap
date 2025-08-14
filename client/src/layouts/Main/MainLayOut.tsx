import { ToasterComp } from '@components/common';
import Header from '@layouts/Header/Header';
import { Outlet } from 'react-router';

const MainLayOut = () => {
  return (
    <div className=" text-gray-800 dark:text-gray-200 ">
      <ToasterComp />
      <Header />
      <div className="bg-transparent mt-7">
        <Outlet />
      </div>
    </div>
  );
};
// container mx-auto flex flex-col min-h-screen
export default MainLayOut;
