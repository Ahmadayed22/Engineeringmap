import { useGetMaterial } from '@hooks/index';
import { SlBookOpen } from 'react-icons/sl';
import { MdDeleteOutline } from 'react-icons/md';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { IoMdAddCircleOutline } from 'react-icons/io';
import MaterialModal from '@components/common/Modal/MaterialModal';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@store/reduxHooks';

type MaterialCardProps = {
  item: { label: string; key: string };
};

const MaterialCard = ({ item }: MaterialCardProps) => {
  const [openModal, setOpenModal] = useState(false);
  const { accessToken } = useAppSelector((state) => state.auth);
  const { userInfo } = useAppSelector((state) => state.auth); // Get current user's ID
  // Assuming only admins can
  const { courseId } = useTreeFlowContext();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetMaterial();
  console.log(data);
  const isOwnMaterial = userInfo?.id === data[0]?.userId; // Check if the current user is the owner of the material
  const deleteMaterial = useMutation({
    mutationFn: (materialId: number) =>
      axios.delete(`/api/resource/${materialId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', courseId] });
      toast.success('Material deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material  ');
    },
  });

  return (
    <div className="flex flex-col  gap-1 mb-2">
      <div className="flex flex-row items-center gap-2 transition justify-end relative mb-3">
        <IoMdAddCircleOutline
          className="text-2xl absolute left-0 cursor-pointer"
          onClick={() => setOpenModal(true)}
        />
        <span className="font-semibold">{item.label}</span>
        <SlBookOpen className="text-lg" />
      </div>
      <MaterialModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        item={item}
      />
      {isLoading ? (
        <span className="text-sm text-end text-gray-500">Loading .. </span>
      ) : isError ? (
        <span className="text-sm text-end text-red-500">خطأ في جلب المواد</span>
      ) : data?.length === 0 ? (
        <span className="text-sm text-end text-gray-400">
          لا توجد مواد متاحة
        </span>
      ) : (
        data?.map((material: any, index: number) =>
          material[item.key] && material[item.key] !== null ? (
            <div
              key={`${item.key}-${index}`}
              className="flex flex-row items-center gap-2 justify-end"
            >
              <a
                href={material[item.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {material[item.key]}
              </a>
              {isOwnMaterial && (
                <button
                  onClick={() => deleteMaterial.mutate(material.id)}
                  disabled={deleteMaterial.isPending}
                  className=" hover:text-red-800 disabled:opacity-50"
                >
                  <MdDeleteOutline className=" cursor-pointer text-2xl" />
                </button>
              )}
            </div>
          ) : null
        )
      )}
    </div>
  );
};

export default MaterialCard;
