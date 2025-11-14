import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Cabecalho from '../components/Cabecalho';
import { useEffect, useState } from 'react';
import Rotas from '../Rotas/Rotas';
import GrupoProdutoCard from '../components/GrupoProdutoCard';
import Carrinho from '../components/Carrinho';
import { useEmpresa } from '../Context/empresaContext';
import { useUser } from '../Context/userContext';
import { ConsultaGrupoProduto } from '../API/api_rotas';
import { reset } from '../Rotas/NavigatorContainerRef';

const GruposProduto = ({ route }: any) => {
  const [grupos, setGrupos] = useState([] as any[]);

  function extrairNomeArquivo(caminho: any) {
    // Encontrar a última ocorrência da barra invertida (\) no caminho
    try {
      let ultimoIndiceBarra = caminho.lastIndexOf('\\');

      if (ultimoIndiceBarra !== -1) {
        // Extrair o nome do arquivo a partir do último índice da barra + 1 até o final
        let nomeArquivo = caminho.substring(ultimoIndiceBarra + 1);
        //console.log('Encontrou: ', nomeArquivo)
        return nomeArquivo;
      } else {
        // Se não encontrar a barra invertida, retorna o caminho original
        return '';
      }
    } catch {
      return '';
    }
  }

  const imgAgua = require('../assets/Images/CMD-iconAgua.png');
  const imgBolos = require('../assets/Images/CMD-iconBolos.png');
  const imgBombom = require('../assets/Images/CMD-iconbombom.png');
  const imgCafe = require('../assets/Images/CMD-iconCafe.png');
  const imgCafeManha = require('../assets/Images/CMD-iconCafeManha.png');
  const imgCastanha = require('../assets/Images/CMD-iconCastanha.png');
  const imgCervejas = require('../assets/Images/CMD-iconCervejas.png');
  const imgChas = require('../assets/Images/CMD-iconChas.png');
  const imgCigarros = require('../assets/Images/CMD-iconCigarros.png');
  const imgCrepe = require('../assets/Images/CMD-iconCrepe.png');
  const imgCuscuz = require('../assets/Images/CMD-iconCuscuz.png');
  const imgDestilados = require('../assets/Images/CMD-iconDestilados.png');
  const imgDrinks = require('../assets/Images/CMD-iconDrinks.png');
  const imgFrios = require('../assets/Images/CMD-iconFrios.png');
  const imgPaes = require('../assets/Images/CMD-iconPaes.png');
  const imgPetisco = require('../assets/Images/CMD-iconPetisco.png');
  const imgPizza = require('../assets/Images/CMD-iconPizza.png');
  const imgPorcoes = require('../assets/Images/CMD-iconPorcoes.png');
  const imgRefeicoes = require('../assets/Images/CMD-iconRefeicoes.png');
  const imgRefrigerante = require('../assets/Images/CMD-iconRefrigerante.png');
  const imgSalgados = require('../assets/Images/CMD-iconSalgados.png');
  const imgSandwitch = require('../assets/Images/CMD-iconSandwitch.png');
  const imgSobremesas = require('../assets/Images/CMD-iconSobremesas.png');
  const imgSopa = require('../assets/Images/CMD-iconSopa.png');
  const imgSorvetes = require('../assets/Images/CMD-iconSorvetes.png');
  const imgSucos = require('../assets/Images/CMD-iconSucos.png');
  const imgSushi = require('../assets/Images/CMD-iconSushi.png');
  const imgTapioca = require('../assets/Images/CMD-iconTapioca.png');
  const imgVinhos = require('../assets/Images/CMD-iconVinhos.png');
  const imgSemImagem = require('../assets/Images/CMD-iconSemImagem.png');

  const { empresa } = useEmpresa();
  const { user } = useUser();
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  useEffect(() => {
    async function getParams() {
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;

      if (servername && serverport && pathbanco) {
        const resultado = await ConsultaGrupoProduto({
          servername,
          serverport,
          pathbanco,
          idempresa,
          grupomestre: route.params?.idgrupoprodutomestre,
        });

        setGrupos(resultado.data);
      } else {
        setGrupos([]);
      }
    }
    getParams();
  }, []);

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        style={s.touchClickGrupo}
        key={item.descricao}
        onPress={() => {
          reset(Rotas.ProdutosInserirMesa, {
            statusmesa: route.params?.statusmesa,
            nummesa: route.params?.nummesa,
            idmovimento: route.params?.idmovimento,
            idgrupoproduto: item.idgrupoproduto,
            idgrupoprodutomestre: route.params?.idgrupoprodutomestre,
          });
        }}
      >
        <GrupoProdutoCard
          key={item.descricao}
          imagem={
            extrairNomeArquivo(item.pathimagem) === 'CMD-iconAgua.png'
              ? imgAgua
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconBolos.png'
              ? imgBolos
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconBombom.png'
              ? imgBombom
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCafe.png'
              ? imgCafe
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCafeManha.png'
              ? imgCafeManha
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCastanha.png'
              ? imgCastanha
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCervejas.png'
              ? imgCervejas
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconChas.png'
              ? imgChas
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCigarros.png'
              ? imgCigarros
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCrepe.png'
              ? imgCrepe
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconCuscuz.png'
              ? imgCuscuz
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconDestilados.png'
              ? imgDestilados
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconDrinks.png'
              ? imgDrinks
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconFrios.png'
              ? imgFrios
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconPaes.png'
              ? imgPaes
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconPetisco.png'
              ? imgPetisco
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconPizza.png'
              ? imgPizza
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconPorcoes.png'
              ? imgPorcoes
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconRefeicoes.png'
              ? imgRefeicoes
              : extrairNomeArquivo(item.pathimagem) ===
                'CMD-iconRefrigerante.png'
              ? imgRefrigerante
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSalgados.png'
              ? imgSalgados
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSandwitch.png'
              ? imgSandwitch
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSobremesas.png'
              ? imgSobremesas
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSopa.png'
              ? imgSopa
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSorvetes.png'
              ? imgSorvetes
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSucos.png'
              ? imgSucos
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconSushi.png'
              ? imgSushi
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconTapioca.png'
              ? imgTapioca
              : extrairNomeArquivo(item.pathimagem) === 'CMD-iconVinhos.png'
              ? imgVinhos
              : imgSemImagem
          }
          descricao={item.descricao}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.MainView}>
      {/* <Text>{JSON.stringify(route?.params)}</Text> */}
      <Cabecalho
        voltarFunction={() => {
          reset(Rotas.GrupoMestre, {
            statusmesa: route.params?.statusmesa,
            nummesa: route.params?.nummesa,
            idmovimento: route.params?.idmovimento,
          });
        }}
      />
      <FlatList
        data={grupos}
        renderItem={renderItem}
        numColumns={2}
        ListFooterComponent={
          <>
            <View style={s.viewbottom} />
          </>
        }
      />
      <Carrinho
        nummesa={route?.params?.nummesa}
        statusmesa={route?.params?.statusmesa}
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
  renderGruposParView: { flexDirection: 'row' },
  touchClickGrupo: { width: '50%' },
  viewbottom: { height: 30 },
});

export default GruposProduto;
