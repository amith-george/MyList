'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ListData = {
  title: string;
  description: string;
};

type ListContextType = {
  listData: ListData | null;
  setListData: (data: ListData) => void;
};

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: ReactNode }) {
  const [listData, setListData] = useState<ListData | null>(null);

  return (
    <ListContext.Provider value={{ listData, setListData }}>
      {children}
    </ListContext.Provider>
  );
}

export function useListContext() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used within a ListProvider');
  }
  return context;
}
