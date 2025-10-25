import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DataMode = 'sample' | 'live';

interface DataModeContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  isLoading: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataModeState] = useState<DataMode>('sample');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('dataMode') as DataMode;
    if (savedMode && (savedMode === 'sample' || savedMode === 'live')) {
      setDataModeState(savedMode);
    }
    setIsLoading(false);
  }, []);

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    localStorage.setItem('dataMode', mode);
  };

  return (
    <DataModeContext.Provider value={{ dataMode, setDataMode, isLoading }}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
}
