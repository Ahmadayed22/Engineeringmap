import { ModalFooter } from 'flowbite-react';

const ModaleeFooterContent = () => {
  return (
    <ModalFooter className="flex flex-col items-end text-right space-y-1">
      <span className="text-white mb-4">
        : <>دلالة الوان الخطة</>
      </span>
      <p className="text-sm text-[#161717]">
        <span className="text-gray-300">مواد هندسة الحاسوب</span> ■
      </p>
      <p className="text-sm text-[#960202]">
        <span className="text-gray-300">مواد كلية العلوم والأي تي</span> ■
      </p>
      <p className="text-sm text-[#029640]">
        <span className="text-gray-300">مواد هندسة الكهربائية</span> ■
      </p>
      {/* Add or modify EE-specific footer items as needed */}
    </ModalFooter>
  );
};

export default ModaleeFooterContent;
