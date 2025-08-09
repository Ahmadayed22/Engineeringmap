import { useDeleteMaterial, useGetMaterial } from '@hooks/index';
import MaterialCard from './MaterialCard';

const materials = [
  { label: 'الكتب', key: 'books' },
  { label: 'ملخصات', key: 'summaries' },
  { label: 'سلايدات ', key: 'slides' },
  { label: 'مختبرات', key: 'labs' },
  { label: 'امتحانات', key: 'exams' },
  { label: 'فيديوهات', key: 'videos' },
];
const MaterialList = () => {
  const { data, isLoading, isError } = useGetMaterial();
  const { deleteMaterial, userId } = useDeleteMaterial();
  return (
    <div className="flex flex-col gap-3 items-end ">
      {materials.map((item) => (
        <div key={item.key} className="w-full ">
          <MaterialCard
            item={item}
            data={data}
            isLoading={isLoading}
            isError={isError}
            deleteMaterial={deleteMaterial}
            userId={userId}
          />
          <hr className="border-t border-gray-300 my-2" />
        </div>
      ))}
    </div>
  );
};

export default MaterialList;
