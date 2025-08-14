'use client';

import { Modal, ModalBody, ModalHeader } from 'flowbite-react';

import SelectMark from '../SelectMark/SelectMark';

type MarkModalprops = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
};
function MarkModal({ openModal, setOpenModal }: MarkModalprops) {
  return (
    <>
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="md">
        <ModalHeader>Add your Mark</ModalHeader>
        <ModalBody>
          <SelectMark />
        </ModalBody>
      </Modal>
    </>
  );
}
export default MarkModal;
