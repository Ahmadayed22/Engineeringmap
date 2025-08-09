// import { IoMdAddCircleOutline } from 'react-icons/io';
import MaterialList from './MaterialList';
// import { useState } from 'react';
// import MaterialModal from '@components/common/Modal/MaterialModal';

const MaterialSection = () => {
  // const [openModal, setOpenModal] = useState(false);
  return (
    <div className="flex flex-col ">
      <div className="flex flex-row items-center justify-end mb-4 gap-2">
        {/* <IoMdAddCircleOutline
          className="text-2xl mb-2 cursor-pointer "
          onClick={() => setOpenModal(true)}
        /> */}
        <h2 className="text-xl font-semibold mb-4 text-end">
          المواد التعليمية
        </h2>
      </div>
      <MaterialList />
      {/* <MaterialModal openModal={openModal} setOpenModal={setOpenModal} /> */}
    </div>
  );
};

export default MaterialSection;
