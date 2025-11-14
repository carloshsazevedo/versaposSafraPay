import React, { createContext, useState, ReactNode, useContext } from 'react';


// Tipo dos dados da empresa
interface Empresa {
  idparametro: number | string | undefined;
  apelido: string | undefined;
  cnpj: string | undefined;
  codigoclientepadraobalcao: number | string | undefined;
  comandasinformarnomecliente: number | string | undefined;
  endbairro: number | string | undefined;
  idestoquepadraopedido: number | string | undefined;
  idformapagtocaixa: number | string | undefined;
  mesasinformarnomecliente: number | string | undefined;
  multiestoques: number | string | undefined;
  nomeempresa: number | string | undefined;
  numerocomandaincauto: number | string | undefined;
  quantidademesas: number | string | undefined;
  taxadeservicogarcom: number | string | undefined;
  tipocomercio: number | string | undefined;
  tipomovimentomesascomandas: number | string | undefined;
  utilizacomanda: number | string | undefined;
  geraparcelaversapospagamento: string | undefined;
  tabelaprecosprodutopadrao: number | string | undefined;
}

// Tipo do contexto
interface EmpresaContextType {
  empresa: Empresa | undefined;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa | undefined>>;
}

// Criando o contexto
const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

// Provider
export const EmpresaProvider = ({ children }: { children: ReactNode }) => {
  const [empresa, setEmpresa] = useState<Empresa | undefined>({
    idparametro: undefined,
apelido: undefined,
cnpj: undefined,
codigoclientepadraobalcao: undefined,
comandasinformarnomecliente: undefined,
endbairro: undefined,
idestoquepadraopedido: undefined,
idformapagtocaixa: undefined,
mesasinformarnomecliente: undefined,
multiestoques: undefined,
nomeempresa: undefined,
numerocomandaincauto: undefined,
quantidademesas: undefined,
taxadeservicogarcom: undefined,
tipocomercio: undefined,
tipomovimentomesascomandas: undefined,
utilizacomanda: undefined,
geraparcelaversapospagamento: undefined,
tabelaprecosprodutopadrao: undefined,
})

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
};

// Hook para usar contexto em qualquer componente
export const useEmpresa = () => {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de UserProvider');
  }
  return context;
};
