import { Modal, ModalBody, ModalFooter } from 'flowbite-react';

import { HiX } from 'react-icons/hi';
type ModalRootProps = {
  isOpen: boolean;
  onClose: () => void;
};
function ModalRoot({ isOpen, onClose }: ModalRootProps) {
  return (
    <>
      <Modal show={isOpen} onClose={onClose}>
        <ModalBody>
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              <HiX className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-auto">
              ملاحظات هامة
            </h3>
          </div>

          <div className="space-y-4 text-right">
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              <span>
                : <strong>متطلبات أخرى</strong>
              </span>
              <br />
              <>
                <span> - الرسم الهندسي والهندسة الوصفية </span>
                <span> - المشاغل الهندسية</span>
                <span> - الكتابةالفنية </span>
                <span> (بعد مهارات الاتصال باللغة الإنجليزية)</span>
              </>
              <br />
              <span>
                الاقتصاد الهندسي (بعد ٩ ساعات) - التدريب العملي (بعد ١٢٠ ساعة) *
              </span>
              <br />
              <span>(بعد ١٢٠ ساعة) - مشروع 1 , مشروع ٢ *</span>
            </p>
            <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              <span>
                : <strong>ملاحظات </strong>
              </span>
              <br />
              <span>
                {' '}
                الخط الابيض المقطع يدل على ان المادة تعتمد على ما قبلها
              </span>
              <br />
              <span>
                {' '}
                - حرف (م) يعني إمكانية تسجيل المادة مع متطلبها السابق بشكل
                متزامن «نفس الفصل»
              </span>
              <br />
              <span>متطلب التخصص الاختياري مكتوب بجانب المادة (اختياري)</span>
              <br />
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col items-end text-right space-y-1">
          <span className="text-white mb-4">
            : <>دلالة الوان الخطة</>
          </span>
          <p className="text-sm text-black dark:text-white">
            <span className="text-gray-300">مواد هندسة الحاسوب</span> ■
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-400">
            <span className="text-gray-300">مواد هندسة الميكاترونيكس</span> ■
          </p>
          <p className="text-sm text-green-700 dark:text-green-400">
            <span className="text-gray-300">مواد هندسة الكهربائية</span> ■
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <span className="text-gray-300">مواد هندسة العلوم</span> ■
          </p>
          <p className="text-sm text-cyan-700 dark:text-cyan-400">
            <span className="text-gray-300">مواد هندسة المعلومات </span> ■
          </p>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default ModalRoot;
