import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Cabecalho from '../components/Cabecalho';
import { useEffect, useState } from 'react';
import Rotas from '../Rotas/Rotas';
import Carrinho from '../components/Carrinho';
import { useEmpresa } from '../Context/empresaContext';
import { useUser } from '../Context/userContext';
import { ConsultaGrupoProdutoMestre } from '../API/api_rotas';
import { reset } from '../Rotas/NavigatorContainerRef';


const GruposMestre = ({ route }: any) => {
  const [gruposMestre, setGruposMestre] = useState([] as any[]);
const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const { empresa } = useEmpresa();
  const { user } = useUser();
  useEffect(() => {
    async function getParams() {
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;

      if (servername && serverport && pathbanco) {
        const resultado = await ConsultaGrupoProdutoMestre({
          servername,
          serverport,
          pathbanco,
          idempresa,
        });

        setGruposMestre(resultado.data);
      } else {
        setGruposMestre([]);
      }
    }
    getParams();
  }, []);

  return (
    <View style={s.MainView}>
      {/* <Text>{JSON.stringify(route.params)}</Text> */}
      <Cabecalho
        voltarFunction={() => {
          reset(Rotas.Mesa, {
            statusmesa: route.params?.statusmesa,
            nummesa: route.params?.nummesa,
            idmovimento: route.params?.idmovimento,
          });
        }}
      />

      <View style={s.Body}>
        {gruposMestre
          .filter(grupo => grupo.tipo)
          .map((grupoMestre, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                reset(Rotas.GrupoProduto, {
                  statusmesa: route.params?.statusmesa,
                  nummesa: route.params?.nummesa,
                  idmovimento: route.params?.idmovimento,
                  idgrupoprodutomestre: grupoMestre.idgrupoprodutomestre,
                });
              }}
            >
              <Image
                style={s.imageStyle}
                alt={'img'}
                source={
                  grupoMestre.tipo === 'A'
                    ? require('../assets/Images/Alimentos.png')
                    : grupoMestre.tipo === 'B'
                    ? require('../assets/Images/Bebidas.png')
                    : require('../assets/Images/Servicos.png')
                }
              />
            </TouchableOpacity>
          ))}
      </View>

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
  imageStyle: { alignSelf: 'center', marginTop: 5, width: 355, height: 110 },
  Body: {
    flex: 1,
  },
});

export default GruposMestre;
