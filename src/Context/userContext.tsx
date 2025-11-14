import React, { createContext, useState, ReactNode, useContext } from "react";

// Este arquivo cria um contexto global chamado UserContext, que serve para guardar e compartilhar informações do usuário (como usuario, cargo e permissoes) em toda a aplicação React Native.

// O UserProvider envolve a aplicação inteira no App.tsx e fornece os dados do usuário para todos os componentes.

// O useUser é um hook que facilita acessar ou atualizar essas informações em qualquer componente, sem precisar passar props manualmente de um componente para outro.  

// Tipo dos dados do usuário
interface User {
  usuario: string | undefined;
  servername: string | undefined;
  serverport: string | undefined;
  pathbanco: string | undefined;
  idfuncionario: string | number | undefined;
}

// Tipo do contexto
interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

// Criando o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    usuario: undefined,
    servername: undefined,
    serverport: undefined,
    pathbanco: undefined,
    idfuncionario: undefined
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar contexto em qualquer componente
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
};
