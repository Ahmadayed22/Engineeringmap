import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useDrEmail = () => {
  const fetchDrEmails = async (
    page: number,
    size: number,
    search: string,
    department: string
  ) => {
    const response = await axios.get('/api/dremails', {
      params: { page, size, search, department },
    });
    return response.data;
  };
  const [page, setPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['drEmails', page, size, search, department],
    queryFn: () => fetchDrEmails(page, size, search, department),
  });
  return {
    data,
    isLoading,
    error,
    page,
    setPage,
    search,
    setSearch,
    department,
    setDepartment,
  };
};

export default useDrEmail;
