import { createContext } from 'react';
import { enqueueSnackbar, OptionsObject } from 'notistack';

interface GlobalProviderProps {
  children: React.ReactNode;
}

interface GlobalContextType {
  useSnackBar: (message: string, options?: OptionsObject) => void;
}

const defaultContext: GlobalContextType = {
  useSnackBar: (message: string, options?: OptionsObject) => {
    console.warn('useSnackBar called without a provider:', message, options);
  },
};

export const GlobalContext = createContext<GlobalContextType>(defaultContext);

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const useSnackBar = (message: string, options?: OptionsObject) => {
    const defaultOptions: OptionsObject = {
      variant: 'default',
      preventDuplicate: true,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
    };

    enqueueSnackbar(message, { ...defaultOptions, ...options });
  };

  const value = {
    useSnackBar,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};
