import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useDrEmail = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  // console.log('Current state:', {
  //   page,
  //   size,
  //   search,
  //   debouncedSearch,
  //   department,
  // });

  const fetchDrEmails = async (
    page: number,
    size: number,
    search: string,
    department: string
  ) => {
    // console.log('API call with params:', { page, size, search, department });
    const response = await axios.get('/api/dremails', {
      params: { page, size, search, department },
    });
    // console.log('API response:', response.data);
    return response.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['drEmails', page, size, debouncedSearch, department],
    queryFn: () => fetchDrEmails(page, size, debouncedSearch, department),
    placeholderData: (previousData) => previousData,
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
    setSize,
  };
};

export default useDrEmail;
