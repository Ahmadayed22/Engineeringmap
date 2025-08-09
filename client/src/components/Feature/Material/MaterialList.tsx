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
  return (
    <div className="flex flex-col gap-3 items-end">
      {materials.map((item) => (
        <div key={item.key} className="w-full">
          <MaterialCard item={item} />
          <hr className="border-t border-gray-300 my-2" />
        </div>
      ))}
    </div>
  );
};

export default MaterialList;
