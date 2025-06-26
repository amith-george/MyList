'use client';

import { createContext, useContext, useState } from 'react';

type FilterType = 'all' | 'movie' | 'tv';

const ListFilterContext = createContext<{
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
}>({
  filterType: 'all',
  setFilterType: () => {},
});

export const ListFilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  return (
    <ListFilterContext.Provider value={{ filterType, setFilterType }}>
      {children}
    </ListFilterContext.Provider>
  );
};

export const useListFilter = () => useContext(ListFilterContext);
