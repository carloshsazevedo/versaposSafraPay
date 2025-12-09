import React, {createContext, useState, ReactNode, useContext} from 'react';

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
  alterarObservacao: (codigobarras: string, novaObs: string) => void;
}

// Criação do contexto
const CarrinhoContext = createContext<CarrinhoContextType | undefined>(
  undefined,
);

// Provider
export const CarrinhoProvider = ({children}: {children: ReactNode}) => {
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);

  // 👉 Função para alterar as observações de um item específico
  const alterarObservacao = (codigobarras: string, novaObs: string) => {
    // console.log('➡️ ALTERANDO OBS');
    // console.log('🔎 Código de barras recebido:', codigobarras);
    // console.log('📝 Nova observação:', novaObs);
    // console.log(
    //   '📦 Carrinho ANTES da alteração:',
    //   JSON.stringify(carrinho, null, 2),
    // );

    setCarrinho(prev => {
      const itemExiste = prev.some(p => p.codigobarras === codigobarras);

      // if (!itemExiste) {
      //   console.log('❌ Nenhum item encontrado com esse código de barras!');
      // } else {
      //   console.log('✔️ Item encontrado, aplicando alteração...');
      // }

      const novoCarrinho = prev.map(item =>
        item.idproduto === Number(codigobarras)
          ? {...item, observacoes: novaObs}
          : item,
      );

      // console.log(
      //   '📦 Carrinho DEPOIS da alteração:',
      //   JSON.stringify(novoCarrinho, null, 2),
      // );
      return novoCarrinho;
    });
  };

  return (
    <CarrinhoContext.Provider
      value={{carrinho, setCarrinho, alterarObservacao}}>
      {children}
    </CarrinhoContext.Provider>
  );
};

// Hook para usar o contexto em qualquer componente
export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  return context;
};
