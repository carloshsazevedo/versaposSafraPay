import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../ThemeContext/colors';
import { ButtonCustom } from '../components/Button';

import { useEffect, useState } from 'react';
import { LoginInputNumeric } from '../components/LoginNumericInput';
import CardMesa from '../components/CardMesa';

import Rotas from '../Rotas/Rotas';
import Cabecalho from '../components/Cabecalho';
import { useDebug } from '../Context/debugContext';
import { MovimentoPesquisa } from '../API/api_rotas';
import { useEmpresa } from '../Context/empresaContext';
import { useUser } from '../Context/userContext';
import formatDate from '../Functions/formatDate';
import { reset } from '../Rotas/NavigatorContainerRef';

type MesaProps = {
  nummesa: any; // ou number, se você souber que é numérico
  [key: string]: any; // permite múltiplas outras chaves
};

const MapaMesas = ({  }: any) => {
  const [pesquisa, setPesquisa] = useState('');

  const { debug } = useDebug();

  const pageSize = 10;
  const [PaginaAtual, setPaginaAtual] = useState(1);
  const [MapaMesasDataRender, setMapaMesasDataRender] = useState(
    [] as MesaProps[],
  );
  const [isLoadingMesaLista, setIsloadingMesaLista] = useState(false);
  const [recarregarMesas, setrecarregarMesas] = useState(0);
  const [modalParametrosVisivel, setmodalParametrosVisivel] = useState(false);

  const { empresa } = useEmpresa();
  const { user } = useUser();

  const [inputGerenciarMesa, setinputGerenciarMesa] = useState('');

  const [data, setdata] = useState<MesaProps[]>([]);

  const pagination = (
    database: MesaProps[],
    PagAtual: any,
    tamanhoPagina: any,
  ) => {
    const StartIndex = (PagAtual - 1) * tamanhoPagina;

    const endIndex = StartIndex + pageSize;

    if (StartIndex >= database.length) {
      return [];
    }

    return database.slice(StartIndex, endIndex);
  };

  useEffect(() => {
    async function getParams() {
      try {
        setIsloadingMesaLista(true);

        const today = new Date();

        const datainiciomovimentos = formatDate(new Date(today), -1); // Data inicial com dia atual - 1
        const datafimmovimentos = formatDate(new Date(today)); // Data final com dia atual

        const response = await MovimentoPesquisa({
          servername: user.servername,
          serverport: user.serverport,
          pathbanco: user.pathbanco,
          idempresa: empresa?.idparametro,
          order: 'nummesa',
          valorpesquisamesa: pesquisa,
          statusmesa: ['R', 'O'],
          datainiciomovimentos,
          datafimmovimentos,
        });

        // Alert.alert('data: ', JSON.stringify(response));
        setdata(response.data);

        setPaginaAtual(1);
        const getMesasIniciais = pagination(response.data, 1, pageSize);
        setMapaMesasDataRender(getMesasIniciais);
        setIsloadingMesaLista(false);
      } catch (error) {
        setIsloadingMesaLista(false);
      }
    }

    getParams();
  }, [recarregarMesas]);

  useEffect(() => {
    if (!pesquisa) {
      setrecarregarMesas(r => r + 1);
      return;
    }

    const mesasFiltradas = data.filter(
      mesa => mesa.nummesa === Number(pesquisa),
    );

    setMapaMesasDataRender(mesasFiltradas);
  }, [pesquisa]);

  return (
    <View style={s.MainView}>
      {/* <Text>{JSON.stringify(route.params)}</Text> */}
      <Cabecalho
        showdebug={
          debug ? String('Qtd renderizada : ' + MapaMesasDataRender.length) : ''
        }
        voltarFunction={() => {
          reset(Rotas.PaginaInicial);
        }}
      />

      <View style={s.body}>
        <LoginInputNumeric
          value={pesquisa}
          onChangeText={setPesquisa}
          placeholder="Pesquisar mesas ocupadas..."
        />
        {isLoadingMesaLista && <ActivityIndicator size={'large'} />}
        <FlatList
          onEndReachedThreshold={0.7}
          onEndReached={() => {
            // console.log('Atualizando lista renderizada...')

            if (isLoadingMesaLista || pesquisa) {
              console.log(
                'retornando pois ainda está carregando, ou existe pesquisa em andamento..',
              );
              return;
            }

            setIsloadingMesaLista(true);

            const ConteudoParaAdicionar = pagination(
              data,
              PaginaAtual + 1,
              pageSize,
            );

            if (ConteudoParaAdicionar.length > 0) {
              setPaginaAtual(PaginaAtual + 1);
              setMapaMesasDataRender(prev => [
                ...prev,
                ...ConteudoParaAdicionar,
              ]);
            }

            setIsloadingMesaLista(false);
          }}
          data={MapaMesasDataRender}
          renderItem={({ item }) => {
            return (
              <View style={s.itemflatlist}>
                <TouchableOpacity
                  onPress={() => {
                    const dataenviar = new Date();

                    reset(Rotas.Mesa, {
                      idmovimento: item.idmovimento,
                      nummesa: item.nummesa,
                      data: `${dataenviar}`,
                      statusmesa: item.statusmesa,
                    });
                  }}
                >
                  <CardMesa mesa={item} />
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={(item, index) => `${item.numero}-${index}`}
          numColumns={2}
        />
      </View>
      <View style={s.footer}>
        <ButtonCustom
          title="Gerenciar Mesa"
          onPress={() => {
            setmodalParametrosVisivel(true);
          }}
        />
      </View>

      <Modal
        visible={modalParametrosVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setmodalParametrosVisivel(false)}
        style={{}}
      >
        <TouchableOpacity
          style={s.modalBackGround}
          onPress={() => {setmodalParametrosVisivel(false);
            setinputGerenciarMesa('')
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Digite o número da mesa:</Text>

              <View style={s.inputgerenciarmesa}>
                <TextInput
                  placeholder={
                    '1, 2, 3 ...' +
                    String(Number(empresa?.quantidademesas) - 1) +
                    ', ' +
                    String(empresa?.quantidademesas)
                  }
                  keyboardType="numeric"
                  value={inputGerenciarMesa}
                  onChangeText={setinputGerenciarMesa}
                />
              </View>

              <ButtonCustom
                style={
                  data.some(item => item.nummesa === Number(inputGerenciarMesa))
                    ? s.ButtonMesaOcupada
                    : s.ButtonMesaLivre
                }
                title={
                  data.some(item => item.nummesa === Number(inputGerenciarMesa))
                    ? 'Operar na mesa'
                    : 'Abrir nova mesa'
                }
                onPress={() => {
                  if (!inputGerenciarMesa){
                    Alert.alert("Alerta", "digite o número da mesa!")
                    return;
                  }
                  setmodalParametrosVisivel(false);
                  
                  const dataenviar = new Date();

                  // procura mesa na lista
                  const mesaExistente = data.find(
                    item => item.nummesa === Number(inputGerenciarMesa),
                  );

                  if (mesaExistente) {
                    // se já existe, navegar com os dados dela
                    reset(Rotas.Mesa, {
                      idmovimento: mesaExistente.idmovimento,
                      nummesa: mesaExistente.nummesa,
                      data: `${dataenviar}`,
                      statusmesa: mesaExistente.statusmesa,
                    });
                  } else {
                    // se não existe, criar nova mesa
                    reset(Rotas.Mesa, {
                      idmovimento: '',
                      nummesa: inputGerenciarMesa,
                      data: `${dataenviar}`,
                      statusmesa: 'L',
                    });
                  }
                }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    flex: 1,
  },
  Header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomColor: colors.CinzaClaro,
    borderBottomWidth: 1,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: colors.CinzaClaro,
    justifyContent: 'center',
  },
  itemflatlist: {
    width: '50%',
    alignItems: 'center',
    marginVertical: 5,
  },
  modalBackGround: {
    flex: 1,
    backgroundColor: 'rgba(1, 1, 1, 0.26)',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#ffff',
    padding: 10,
  },
  modalTitle: {
    marginVertical: 16,
    marginLeft: 10,
    fontSize: 18,
    color: colors.AzulMaisClaro,
    fontWeight: 'bold',
  },
  inputgerenciarmesa: {
    borderWidth: 1,
    borderColor: colors.CinzaClaro,
    marginBottom: 20,
    borderRadius: 6,
  },
  ButtonMesaOcupada: {
    backgroundColor: 'red',
  },
  ButtonMesaLivre: { backgroundColor: 'green' },
});

export default MapaMesas;
