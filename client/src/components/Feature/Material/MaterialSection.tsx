import MaterialList from './MaterialList';
import { useI18n } from '@i18n/context';

const MaterialSection = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col">
      <h2 className="mb-6 text-start text-xl font-semibold text-white">
        {t('mat.title')}
      </h2>
      <MaterialList />
    </div>
  );
};

export default MaterialSection;
