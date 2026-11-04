'use client';

import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

import SelectMark from '../SelectMark/SelectMark';
import { useI18n } from '@i18n/context';

type MarkModalprops = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
};
function MarkModal({ openModal, setOpenModal }: MarkModalprops) {
  const { t } = useI18n();
  return (
    <>
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        size="md"
        className="z-150"
      >
        <ModalHeader className="!bg-[#171717]">{t('grade.title')}</ModalHeader>
        <ModalBody className="!bg-[#171717]">
          <SelectMark />
        </ModalBody>
      </Modal>
    </>
  );
}
export default MarkModal;
