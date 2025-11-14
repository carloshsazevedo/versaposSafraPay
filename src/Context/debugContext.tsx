import { createContext, ReactNode, useContext, useState } from 'react';

interface debugContextType {
  debug: false | true;
  setDebug: (value: boolean) => void;
}

const debugContext = createContext<debugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children: ReactNode }) => {

  const [debug, setDebug] = useState<boolean>(false);

  return <debugContext.Provider value={{debug, setDebug}}>{children}</debugContext.Provider>;
};

export const useDebug = () => {
 const context = useContext(debugContext);

 if (!context) {
    throw new Error("useDebug precisa ser chamado dentro de <DebugProvider />") 
 }
 return context;
}


