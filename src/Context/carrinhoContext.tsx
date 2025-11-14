import React, { createContext, useState, ReactNode, useContext } from "react";

// Tipo de um produto no carrinho
export interface ProdutoCarrinho {
  codigobarras: string;
  descricao: string;
  idestoque: number;
  idproduto: number;
  imagemcadastro?: number | null;
  observacoes?: string | null;
  precovenda: number;
  quantidade: number;
  siglaunimedida: string;
  tipo: string;
}

// Tipo do contexto
interface CarrinhoContextType {
  carrinho: ProdutoCarrinho[];
  setCarrinho: React.Dispatch<React.SetStateAction<ProdutoCarrinho[]>>;
}

// Criação do contexto
const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

// Provider
export const CarrinhoProvider = ({ children }: { children: ReactNode }) => {
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);

  return (
    <CarrinhoContext.Provider value={{ carrinho, setCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

// Hook para usar o contexto em qualquer componente
export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider");
  }
  return context;
};
