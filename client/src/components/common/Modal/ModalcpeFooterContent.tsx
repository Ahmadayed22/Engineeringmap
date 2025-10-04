import { ModalFooter } from 'flowbite-react';

const ModalcpeFooterContent = () => {
  return (
    <ModalFooter className="flex flex-col items-end text-right space-y-1">
      <span className="text-white mb-4">
        : <>دلالة الوان الخطة</>
      </span>
      <p className="text-sm text-[#87032f]">
        <span className="text-gray-300">مواد هندسة الحاسوب</span> ■
      </p>
      <p className="text-sm text-[#631d3b]">
        <span className="text-gray-300">مواد هندسة الميكاترونيكس</span> ■
      </p>
      <p className="text-sm text-[#166e25]">
        <span className="text-gray-300">مواد هندسة الكهربائية</span> ■
      </p>
      <p className="text-sm text-[#a87716]">
        <span className="text-gray-300">مواد كلية تكنولوجيا المعلومات</span> ■
      </p>
      <p className="text-sm text-[#0f3460]">
        <span className="text-gray-300">مواد كلية العلوم</span> ■
      </p>
    </ModalFooter>
  );
};

export default ModalcpeFooterContent;
