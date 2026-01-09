import { getApi } from './api';

export async function loginValidarAcesso(credentials: any) {
  const api = await getApi();
  const response = await api.post('/login/validaracesso', credentials);
  return response;
}

export async function loginEfetuarLogin(credentials: any) {
  const api = await getApi();
  const response = await api.post('login/efetuarlogin', credentials);
  return response;
}

export async function ConsultaParametros(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/parametros', credentials);
  return response;
}

export async function MovimentoPesquisa(credentials: any) {
  const api = await getApi();
  const response = await api.post('/movimento/pesquisa', credentials);
  return response;
}

export async function ConsultaFornecedor(credentials: any) {
  const api = await getApi();
  const response = await api.post('consulta/fornecedormovimento', credentials);
  return response;
}

export async function ItemmovimentoPesquisaitemmovimentocomandas(
  credentials: any,
) {
  const api = await getApi();
  const response = await api.post(
    '/itemmovimento/pesquisaitemmovimentocomandas',
    credentials,
  );
  return response;
}

export async function ParcelaPesquisa(credentials: any) {
  const api = await getApi();
  const response = await api.post('/parcela/pesquisa', credentials);
  return response;
}


export async function ConsultaMovimentoPagamento(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/movimentopagamento', credentials);
  return response;
}


export async function CadastroMovimentoPagamento(credentials: any) {
  const api = await getApi();
  const response = await api.post('/cadastro/movimentopagamento', credentials);
  return response;
}


export async function ConsultaGrupoProdutoMestre(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/grupoprodutomestre', credentials);
  return response;
}


export async function ConsultaGrupoProduto(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/grupoproduto', credentials);
  return response;
}


export async function ProdutoPesquisaMultiEstoque(credentials: any) {
  const api = await getApi();
  const response = await api.post('/produto/pesquisa', credentials);
  return response;
}

export async function MovimentoCriarMesa(credentials: any) {
  const api = await getApi();
  const response = await api.post('/movimento/criarmesa', credentials);
  return response;
}

export async function MovimentoInserirItensCarrinhoMesa(credentials: any) {
  const api = await getApi();
  const response = await api.post('/movimento/insereitenscarrinhomesa', credentials);
  return response;
}

export async function ConsultaEstoquesVisivelVenda(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/estoques', credentials);
  return response;
}

export async function ProdutoImagemProduto(credentials: any) {
  const api = await getApi();
  const response = await api.post('/produto/imagemproduto', credentials);
  return response;
}

export async function ConsultaFornecedorParceiro(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/fornecedor', credentials);
  return response;
}

export async function UpdateFornecedorMovimento(credentials: any) {
  const api = await getApi();
  const response = await api.post('/update/fornecedormovimento', credentials);
  return response;
}

export async function RemoveItemMovimento(credentials: any) {
  const api = await getApi();
  const response = await api.post('/itemmovimento/removeitemmovimento', credentials);
  return response;
}

export async function MesaTransferirItensMesa(credentials: any) {
  const api = await getApi();
  const response = await api.post('/mesas/transferiritensmesa', credentials);
  return response;
}

export async function ConsultaObservacoes(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/observacoes', credentials);
  return response;
}

export async function MovimentoInsereitemcomanda(credentials: any) {
  const api = await getApi();
  const response = await api.post('/movimento/insereitemcomanda', credentials);
  return response;
}

export async function UsuarioPermissoes(credentials: any) {
  const api = await getApi();
  const response = await api.post('/usuario/permissoes', credentials);
  return response;
}

export async function imprimirConta(credentials: any) {
  const api = await getApi();
  const response = await api.post('/imprimirconta', credentials);
  return response;
}

export async function CadastroItemmovimentoPago(credentials: any) {
  const api = await getApi();
  const response = await api.post('/cadastro/itemmovimentopago', credentials);
  return response;
}

export async function ConsultaImtemmovimentopago(credentials: any) {
  const api = await getApi();
  const response = await api.post('/consulta/itemmovimentopago', credentials);
  return response;
}








// export async function loginUser(credentials) {
//   const api = await getApi();
//   return api.post("/auth/login", credentials);
// }

// export async function getUsers() {
//   const api = await getApi();
//   return api.get("/users");
// }
