import React, { useCallback } from 'react';
import { DrEmail } from '@customTypes/DrEmail';
import useDrEmail from '@hooks/CustomHook/useDrEmail';

const DrEmailTable = () => {
  const {
    data,
    isLoading,
    error,
    page,
    setPage,
    search,
    setSearch,
    department,
    setDepartment,
  } = useDrEmail();

  // Use useCallback to prevent function recreation on each render
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [setSearch]
  );

  const handleDepartmentChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDepartment(e.target.value);
      setPage(0); // Reset to first page when department changes
    },
    [setDepartment, setPage]
  );

  const handlePrevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, [setPage]);

  const handleNextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, (data?.totalPages || 1) - 1));
  }, [setPage, data?.totalPages]);

  if (isLoading)
    return <div className="text-center py-6 text-white">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-400 py-6">Error loading data</div>
    );

  if (!data) {
    return <div className="text-center py-6 text-white">No data available</div>;
  }

  const { content = [], totalPages = 0, number = 0 } = data;

  const departments = [
    { value: '', label: 'جميع الأقسام' },
    { value: 'هندسة الحاسوب', label: 'هندسة الحاسوب' },
    { value: 'هندسة الكهرباء', label: 'هندسة الكهرباء' },
  ];

  return (
    <div className="custom-bg p-6 min-h-screen">
      <div className="w-xs md:w-xl ml-auto flex flex-row items-center justify-between gap-4 mb-6 bg-[#1F2937] p-4 rounded-2xl shadow-lg">
        <input
          type="text"
          placeholder="🔍 ابحث بالاسم أو البريد"
          value={search}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
        />

        <select
          value={department}
          onChange={handleDepartmentChange}
          className="w-full md:w-1/2 border border-gray-600 bg-gray-800 text-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          {departments.map((dep) => (
            <option
              key={dep.value}
              value={dep.value}
              className="bg-gray-800 text-gray-200"
            >
              {dep.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#1F2937] rounded-2xl shadow-lg">
        <table className="w-full border-collapse text-center">
          <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <tr>
              <th className="p-3 font-semibold">القسم</th>
              <th className="p-3 font-semibold">البريد الإلكتروني</th>
              <th className="p-3 font-semibold">الاسم</th>
            </tr>
          </thead>
          <tbody>
            {content.length > 0 ? (
              content.map((item: DrEmail, index: number) => (
                <tr
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'
                  } hover:bg-gray-600 transition`}
                >
                  <td className="p-3 text-gray-200">{item.department}</td>
                  <td className="p-3 text-blue-400 font-medium">
                    {item.email}
                  </td>
                  <td className="p-3 font-semibold text-white">{item.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-gray-400 text-center">
                  لا توجد بيانات متاحة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 text-gray-200">
        <button
          onClick={handlePrevPage}
          disabled={page === 0}
          className={`px-4 py-2 rounded-lg shadow transition ${
            page === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white cursor-pointer'
          }`}
        >
          ⬅ السابق
        </button>
        <span className="font-medium">
          الصفحة {number + 1} من {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages - 1}
          className={`px-4 py-2 rounded-lg shadow transition ${
            page === totalPages - 1
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white cursor-pointer'
          }`}
        >
          التالي ➡
        </button>
      </div>
    </div>
  );
};

export default DrEmailTable;
