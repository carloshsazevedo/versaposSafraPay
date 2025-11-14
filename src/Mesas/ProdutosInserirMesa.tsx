import { FlatList, StyleSheet, View } from 'react-native';
import Cabecalho from '../components/Cabecalho';
import { useCallback, useEffect, useState } from 'react';
import ProdutoCard from '../components/CardProdutoInserirMesa';
import Carrinho from '../components/Carrinho';
import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';
import { ProdutoPesquisaMultiEstoque } from '../API/api_rotas';
import Rotas from '../Rotas/Rotas';
import { reset } from '../Rotas/NavigatorContainerRef';
import { useCarrinho } from '../Context/carrinhoContext';
// import React, { useCallback, useMemo } from 'react';

const ProdutosInserirMesa = ({ route }: any) => {

  console.log('renderizando tela ProdutosInserirMesa')
  const [produtos, setprodutos] = useState([] as any[]);
  const { setCarrinho } = useCarrinho();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const { user } = useUser();
  const { empresa } = useEmpresa();

  const handleInsert = useCallback((
    produto: any,
    quantidadeAdicionar: number,
  ) => {
    setCarrinho(prevCarrinho => {
      const produtoExistente = prevCarrinho.find(
        item => item.idproduto === produto.idproduto,
      );

      if (produtoExistente) {
        // Se já existe, atualiza a quantidade e o idEstoque
        setCarrinhoAberto(true)
        return prevCarrinho.map(item =>
          item.idproduto === produto.idproduto
            ? {
                ...item,
                quantidade: item.quantidade + quantidadeAdicionar,

              }
            : item,
        );
      } else {
        // Se não existe, adiciona novo produto
        // console.log(carrinho);
        setCarrinhoAberto(true)
        return [
          ...prevCarrinho,
          {
            ...produto,
            quantidade: quantidadeAdicionar,
          },
        ];
      }
    });
  },[setCarrinho]);

  useEffect(() => {
    async function getParams() {
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;
      const tabelaprecosprodutopadrao = empresa?.tabelaprecosprodutopadrao;

      if (servername && serverport && pathbanco) {
        const resultado = await ProdutoPesquisaMultiEstoque({
          servername,
          serverport,
          pathbanco,
          tipopesquisa: '5',
          valorpesquisa: route.params?.idgrupoproduto,
          comandas: '1',
          valido: 'S',
          multiestoque: true,
          idempresa,
          tabelaprecosprodutopadrao,
        });

        // Alert.alert('retorno: ', JSON.stringify(resultado.data));
        setprodutos(resultado.data);
      } else {
        setprodutos([]);
      }
    }

    getParams();
  }, []);

  // const renderitem = ({ item }: any) => {
  //   return <ProdutoCard handleInsert={handleInsert} produto={item} />;
  // };

  const renderitem = useCallback(
    ({ item }: any) => (
      <ProdutoCard handleInsert={handleInsert} produto={item} />
    ),
    [handleInsert],
  );

  const keyExtractor = useCallback(
    (item: any) => `${item.codigobarras}` + `-${item.idestoque}`,
    []
  );
  return (
    <View style={s.MainView}>
      {/* <Text>{JSON.stringify(route?.params)}</Text> */}

      <Cabecalho
        voltarFunction={() => {
          reset(Rotas.GrupoProduto, {
            statusmesa: route.params?.statusmesa,
            nummesa: route.params?.nummesa,
            idmovimento: route.params?.idmovimento,
            idgrupoprodutomestre: route.params?.idgrupoprodutomestre,
          });
        }}
      />

      {/*
      <Text>{empresa?.idestoquepadraopedido}</Text> */}

      <View style={s.Body}>
        <FlatList
          data={produtos}
          renderItem={renderitem}
          keyExtractor={keyExtractor}
          numColumns={2}
          
        />
      </View>

      <Carrinho
        statusmesa={route.params?.statusmesa}
        nummesa={route.params?.nummesa}
        idmovimento={route.params?.idmovimento}
        carrinhoAberto={carrinhoAberto}
        setCarrinhoAberto={setCarrinhoAberto}
      />
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    flex: 1,
  },
  Body: {
    flex: 1,
    marginHorizontal: 5,
    marginTop: 5,
  },
  viewItemCarrinho: { width: '100%', justifyContent: 'center' },
});

export default ProdutosInserirMesa;
