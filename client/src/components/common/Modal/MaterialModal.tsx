import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import InputForm from '../InputForm/InputForm';
import useMaterial from '@hooks/CustomHook/useMaterial';
import { useI18n } from '@i18n/context';

export type MaterialModalProps = {
  openModal?: boolean;
  setOpenModal: (open: boolean) => void;
  item?: { label: string; key: string };
};

/** Add a link (book, summary, slides, ...) to the course's materials. */
function MaterialModal({ openModal, setOpenModal, item }: MaterialModalProps) {
  const { register, handleSubmit, errors, submitMaterial, onCloseModal } =
    useMaterial({
      setOpenModal,
    });
  const { t } = useI18n();
  const key = item?.key ?? '';
  const urlError =
    errors[key as keyof typeof errors]?.message ??
    (errors as Record<string, { message?: string } | undefined>)._url?.message;

  return (
    <Modal
      show={openModal}
      size="md"
      onClose={onCloseModal}
      popup
      className="z-150"
    >
      <ModalHeader className="!bg-[#171717] p-6">
        {t('mat.modalTitle')}
        {item?.label ? ` · ${item.label}` : ''}
      </ModalHeader>
      <ModalBody className="!bg-[#171717]">
        <form
          className="space-y-6"
          onSubmit={handleSubmit(submitMaterial)}
          noValidate
        >
          <InputForm
            label={t('mat.nameLabel')}
            name="name"
            register={register}
            placeholder={t('mat.namePh')}
            error={errors.name?.message}
          />
          <InputForm
            label={t('mat.urlLabel')}
            id={`material-${key}`}
            name={key}
            type="url"
            register={register}
            placeholder={t('mat.urlPh')}
            error={urlError}
          />
          <div className="flex justify-end gap-2">
            <Button
              className="cursor-pointer"
              color="gray"
              onClick={onCloseModal}
            >
              {t('common.cancel')}
            </Button>
            <Button className="cursor-pointer" type="submit">
              {t('common.add')}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

export default MaterialModal;
