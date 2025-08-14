import MaterialList from './MaterialList';

const MaterialSection = () => {
  return (
    <div className="flex flex-col ">
      <div className="flex flex-row items-center justify-end mb-4 gap-2">
        <h2 className="text-xl font-semibold mb-4 text-end">
          المواد التعليمية
        </h2>
      </div>
      <MaterialList />
    </div>
  );
};

export default MaterialSection;
