import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';

type ModalDeleteProps = {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  onDelete: () => void;
};

function ModalDelete({ openModal, setOpenModal, onDelete }: ModalDeleteProps) {
  return (
    <Modal
      show={openModal}
      onClose={() => setOpenModal(false)}
      className="cursor-not-allowed z-150"
      theme={{
        header: {
          close: {
            base: 'cursor-pointer text-gray-500 hover:text-gray-700', // Add cursor-pointer
          },
        },
      }}
    >
      <div className="bg-[#171717] rounded-lg">
        {' '}
        {/* Wrap content for background */}
        <ModalHeader className="bg-[#171717] text-white">
          Delete Comment
        </ModalHeader>
        <ModalBody className="bg-[#171717]">
          <div className="space-y-6">
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment? This Action cannot
              be undone.
            </h3>
          </div>
          <div className="flex justify-end mt-5 gap-2">
            <Button
              className="cursor-pointer"
              onClick={() => setOpenModal(false)}
              color="alternative"
            >
              Close
            </Button>
            <Button
              className="cursor-pointer"
              color="red"
              onClick={() => onDelete()}
            >
              Delete
            </Button>
          </div>
        </ModalBody>
      </div>
    </Modal>
  );
}

export default ModalDelete;
