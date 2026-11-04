import { useDeleteMaterial, useGetMaterial } from '@hooks/index';
import MaterialCard from './MaterialCard';
import { useI18n } from '@i18n/context';

const categories = [
  { key: 'books', labelKey: 'mat.books' },
  { key: 'summaries', labelKey: 'mat.summaries' },
  { key: 'slides', labelKey: 'mat.slides' },
  { key: 'labs', labelKey: 'mat.labs' },
  { key: 'exams', labelKey: 'mat.exams' },
  { key: 'videos', labelKey: 'mat.videos' },
] as const;

const MaterialList = () => {
  const { data, isLoading, isError } = useGetMaterial();
  const { deleteMaterial, userId, courseId } = useDeleteMaterial();
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-3">
      {categories.map((c) => (
        <div key={c.key} className="w-full">
          <MaterialCard
            item={{ key: c.key, label: t(c.labelKey) }}
            data={data}
            isLoading={isLoading}
            isError={isError}
            deleteMaterial={deleteMaterial}
            userId={userId}
            courseId={courseId}
          />
          <hr className="my-2 border-t border-gray-300" />
        </div>
      ))}
    </div>
  );
};

export default MaterialList;
