import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import InputForm from '../InputForm/InputForm';
import useMaterial from '@hooks/CustomHook/useMaterial';

export type MaterialModalProps = {
  openModal?: boolean;
  setOpenModal: (open: boolean) => void;
  item?: { label: string; key: string };
};

function MaterialModal({ openModal, setOpenModal, item }: MaterialModalProps) {
  const { register, handleSubmit, errors, submitMaterial, onCloseModal } =
    useMaterial({ setOpenModal });

  return (
    <Modal
      show={openModal}
      size="md"
      onClose={onCloseModal}
      popup
      className="z-150 "
    >
      <ModalHeader className="p-6 !bg-[#171717]">Add Material</ModalHeader>
      <ModalBody className="!bg-[#171717]">
        <form className="space-y-6" onSubmit={handleSubmit(submitMaterial)}>
          <InputForm
            label={
              item?.key
                ? item.key.charAt(0).toUpperCase() + item.key.slice(1)
                : ''
            }
            id={item?.key || ''}
            name={item?.key || ''}
            register={register}
            placeholder={`Enter ${item?.key} URL Link`}
            error={errors.books?.message}
          />
          {/* <InputForm
            label="Summaries"
            id="summaries"
            name="summaries"
            register={register}
            placeholder="summaries URL Link"
            error={errors.summaries?.message}
          />
          <InputForm
            label="Slides"
            id="slides"
            name="slides"
            register={register}
            placeholder="slides URL Link"
            error={errors.slides?.message}
          />
          <InputForm
            label="Labs"
            id="labs"
            name="labs"
            register={register}
            placeholder="labs URL Link"
            error={errors.labs?.message}
          />
          <InputForm
            label="Exams"
            id="exams"
            name="exams"
            register={register}
            placeholder="exams URL Link"
            error={errors.exams?.message}
          />
          <InputForm
            label="Videos"
            id="videos"
            name="videos"
            register={register}
            placeholder="videos URL Link"
            error={errors.videos?.message}
          /> */}
          <div className="flex gap-2  justify-end">
            <Button
              className="cursor-pointer"
              color="gray"
              onClick={onCloseModal}
            >
              Close
            </Button>
            <Button className="cursor-pointer" type="submit">
              ADD
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

export default MaterialModal;
