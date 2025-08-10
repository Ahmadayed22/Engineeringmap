import { SlBookOpen } from 'react-icons/sl';
import { MdDeleteOutline } from 'react-icons/md';
import { IoMdAddCircleOutline } from 'react-icons/io';
import MaterialModal from '@components/common/Modal/MaterialModal';
import React, { useState } from 'react';
import { useDeleteMaterial } from '@hooks/index';
import { Material } from '@customTypes/Material';
import { useAppSelector } from '@store/reduxHooks';

type MaterialCardProps = {
  item: { label: string; key: string };
  data: Material[] | undefined;
  isLoading: boolean;
  isError: boolean;
  deleteMaterial: ReturnType<typeof useDeleteMaterial>['deleteMaterial'];
  userId: number | undefined;
};

const MaterialCard = ({
  item,
  data,
  isLoading,
  isError,
  deleteMaterial,
  userId,
}: MaterialCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const { userInfo } = useAppSelector((state) => state.auth);
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex flex-row items-center gap-2 transition justify-end relative mb-3">
        {userInfo && (
          <IoMdAddCircleOutline
            className="text-2xl absolute left-0 cursor-pointer"
            onClick={() => setOpenModal(true)}
          />
        )}

        <span className="font-semibold">{item.label}</span>
        <SlBookOpen className="text-lg" />
      </div>
      <MaterialModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        item={item}
      />
      {isLoading ? (
        <span className="text-sm text-end text-gray-500">Loading...</span>
      ) : isError ? (
        <span className="text-sm text-end text-red-500">خطأ في جلب المواد</span>
      ) : !data || data.length === 0 ? (
        <span className="text-sm text-end text-gray-400">
          لا توجد مواد متاحة
        </span>
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((material: any, index: number) =>
          material[item.key] && material[item.key] !== null ? (
            <div
              key={`${item.key}-${index}`}
              className="flex flex-row items-center gap-2 justify-end"
            >
              <a
                href={material[item.key] as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {material[item.key]}
              </a>
              {userId && material.userId === userId && (
                <button
                  onClick={() => deleteMaterial.mutate(material.id)}
                  disabled={deleteMaterial.isPending}
                  className="hover:text-red-800 disabled:opacity-50"
                >
                  <MdDeleteOutline className="cursor-pointer text-2xl" />
                </button>
              )}
            </div>
          ) : null
        )
      )}
    </div>
  );
};

export default React.memo(MaterialCard);
