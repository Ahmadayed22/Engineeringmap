import { Modal, ModalBody } from 'flowbite-react';

import { HiX } from 'react-icons/hi';
import ModaleeFooterContent from './ModaleeFooterContent';
import ModalcpeFooterContent from './ModalcpeFooterContent';
type ModalRootProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Roadmap id; CPE and EE have their own notes below the general ones. */
  flowType: string;
};
function ModalRoot({ isOpen, onClose, flowType }: ModalRootProps) {
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
                الخط الابيض المتقطع يدل على ان المادة تعتمد على ما قبلها
              </span>
              <br />
              <span>
                {' '}
                الخط المتقطع يدل على ان المادة يمكن تسجيلها بشكل متزامن , نفس
                الفصل{' '}
              </span>
              <br />
              <span>متطلب التخصص الاختياري مكتوب بجانب المادة (اختياري)</span>
              <br />
            </p>
          </div>
        </ModalBody>

        {flowType === 'cpe' && <ModalcpeFooterContent />}
        {flowType === 'ee' && <ModaleeFooterContent />}
      </Modal>
    </>
  );
}

export default ModalRoot;
