import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Cabecalho from '../components/Cabecalho';
import CardNumMesa from '../components/CardNumMesa';
import CardParceiro from '../components/CardParceiro';
import CardParceiroSelecionado from '../components/CardParceiroSelecionado';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {CardMesaInfo} from '../components/CardsMesaInfo';
import CardMesaDisponivel from '../components/CardMesaDisponível';
import CardItensMovimento from '../components/CardItensMovimento';
import CardTrasnfetirImprimir from '../components/CardTrasnfetirImprimir';
import Rotas from '../Rotas/Rotas';
import {useUser} from '../Context/userContext';
import {
  ConsultaFornecedor,
  ItemmovimentoPesquisaitemmovimentocomandas,
  ConsultaMovimentoPagamento,
  RemoveItemMovimento,
} from '../API/api_rotas';
import {useEmpresa} from '../Context/empresaContext';
import CardReceberPagamento from '../components/CardReceberPagamento';
import {reset} from '../Rotas/NavigatorContainerRef';
import {useCarrinho} from '../Context/carrinhoContext';
import ModalSelecionarFornecedor from '../components/ModalSelecionarFornecedor';
import LinearGradient from 'react-native-linear-gradient';
import CardReceberPagamentoParcial from '../components/CardReceberPagamentoParcial';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Mesa = ({route}: any) => {
  const {setCarrinho} = useCarrinho();

  // const [nomeFornecedor, setnomeFornecedor] = useState('');
  const [dados, setdados] = useState({} as any);
  // const [tipoFornecedor, settipoFornecedor] = useState('');
  // const [cnpjFornecedor, setcnpjFornecedor] = useState('');
  const [idmovimento] = useState(route.params?.idmovimento);
  // const [nomeCliente, setNomeCliente] = useState('');
  // const [nomeGarcom, setnomeGarcom] = useState('');
  // const [dataAbertura, setdataAbertura] = useState('');
  // const [tempoUtilizacao, settempoUtilizacao] = useState('');
  // const [Taxa, setTaxa] = useState(0.0);
  // const [Consumacao, setConsumacao] = useState(0.0);
  // const [totalMesa, settotalMesa] = useState(0.0);
  const {user} = useUser();
  const {empresa} = useEmpresa();

  console.log('renderizando BOOOOOOOOOOOOOOOOOO!');

  const [pagamentoparcial, setpagamentoparcial] = useState(false);

  const [
    showmodalescolhernummesatransferir,
    setshowmodalescolhernummesatransferir,
  ] = useState(false);

  const [nummesatransferir, setnummesatransferir] = useState('');

  const [itensmovimento, setitensmovimento] = useState([] as any[]);

  const [showpagamentosrecebidos, setshowpagamentosrecebidos] = useState(true);

  const [showmodalreceberpagamento, setshowmodalreceberpagamento] =
    useState(false);

  const [pagamentos, setpagamentos] = useState<any[]>([]);
  const [visibleModalFornecedor, setvisibleModalFornecedor] = useState(false);

  // flags de loading
  const [loadingMesa, setLoadingMesa] = useState(false);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

  const [TRANSFERIR_ITENS_MESA, setTRANSFERIR_ITENS_MESA] = useState('')

  // formatar data "2025-09-26T13:45:00.000Z" em "26/09/2025 13:45"
  const formatarData = useCallback((dataString: any) => {
    const data = new Date(dataString);

    const adicionarZero = (numero: number) =>
      numero < 10 ? `0${numero}` : `${numero}`;

    const dia = adicionarZero(data.getUTCDate());
    const mes = adicionarZero(data.getUTCMonth() + 1);
    const ano = data.getUTCFullYear();
    const horas = adicionarZero(data.getUTCHours());
    const minutos = adicionarZero(data.getUTCMinutes());

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }, []);

  const convertToHHMMSS = useCallback((decimalTime: any) => {
    const totalSeconds = Math.floor(decimalTime * 24 * 3600);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ].join(':');

    return formattedTime;
  }, []);

  async function carregarPagamentos() {
    setLoadingPagamentos(true);
    console.log('Carregando pagamentos!');
    try {
      if (empresa?.geraparcelaversapospagamento === 'S') {
        const servername = user.servername;
        const serverport = user.serverport;
        const pathbanco = user.pathbanco;
        const idempresa = empresa?.idparametro;

        const result = (await ConsultaMovimentoPagamento({
          serverport,
          servername,
          pathbanco,
          idmovimento,
          idempresa,
        })) as any;
        console.log('Res: ', result);

        setpagamentos(result.data ?? []);
      }
    } catch (error) {
    } finally {
      setLoadingPagamentos(false);
    }
  }

  useEffect(() => {
    async function getParams() {
      const TRANSFERIR_ITENS_MESA = await AsyncStorage.getItem("TRANSFERIR_ITENS_MESA")
      setTRANSFERIR_ITENS_MESA(TRANSFERIR_ITENS_MESA || '')
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;
      const tipomovimento = empresa?.tipomovimentomesascomandas;

      if (
        !servername ||
        !serverport ||
        !pathbanco ||
        !idempresa ||
        !idmovimento
      ) {
        return;
      }

      try {
        setLoadingMesa(true);

        // 🔥 CONSULTAS EM PARALELO (muito mais rápido)
        const [fornecedorResp, itensResp] = await Promise.all([
          ConsultaFornecedor({
            serverport,
            servername,
            pathbanco,
            idmovimento,
            idempresa,
          }),

          ItemmovimentoPesquisaitemmovimentocomandas({
            servername,
            serverport,
            pathbanco,
            idmovimento,
            tipomovimento,
            idempresa,
          }),
        ]);

        /** =============================
         ** Cabeçalho
         ** ============================= */
        const dados = fornecedorResp.data?.[0];
        if (!dados) {
          Alert.alert('Atenção', 'Não foi possível carregar os dados da mesa.');
          return;
        }

        // setNomeCliente(dados.nomeCliente);

        // setnomeFornecedor(dados.nomefornecedor ?? '');

        // setcnpjFornecedor(dados.cnpjfornecedor ?? '');

        // settipoFornecedor(dados.tipofornecedor ?? '');

        // setnomeGarcom(dados.nomefuncionario);

        // setdataAbertura(formatarData(dados.datamovimento));

        // settempoUtilizacao(convertToHHMMSS(dados.tempoutilizacao));

        // setTaxa(dados.valorservicomesa ?? 0);

        setdados(dados);

        // setConsumacao(
        //   dados.qtepessoasmesa
        //     ? (dados.totalmovimento + (dados.valorservicomesa ?? 0)) /
        //         dados.qtepessoasmesa
        //     : 0,
        // );

        // settotalMesa(dados.totalmovimento ?? 0);

        /** =============================
         ** Itens
         ** ============================= */
        setitensmovimento(itensResp.data ?? []);

        /** =============================
         ** Pagamentos
         ** ============================= */
        setLoadingMesa(false);
      } catch (error) {
        console.error('Erro ao carregar dados da mesa:', error);
        Alert.alert(
          'Erro',
          'Ocorreu um problema ao carregar os dados da mesa.',
        );
      } finally {
        setLoadingMesa(false);
      }
    }

    getParams();
  }, []);

  const [EXCLUIR_ITEM_CASH, setEXCLUIR_ITEM_CASH] = useState("")

  const removerItem = useCallback(
    async (iditemmovimento: any) => {
      
      const EXCLUIR_ITEM_CASH = await AsyncStorage.getItem("EXCLUIR_ITEM_CASH")
      
      if (!EXCLUIR_ITEM_CASH) {
        Alert.alert("Erro: ", "Usuário sem permissão para excluir item da mesa.")
        return;
      }

      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;
      const idusuario = user.usuario;

      const resultado = await RemoveItemMovimento({
        servername: servername,
        serverport: serverport,
        pathbanco: pathbanco,
        iditemmovimento: iditemmovimento,
        idusuario: idusuario,
        idempresa: idempresa,
      });

      if (resultado) {
        const dataenviar = new Date();
        reset(Rotas.Mesa, {
          idmovimento: idmovimento,
          nummesa: route?.params?.nummesa,
          data: `${dataenviar}`,
          statusmesa: route?.params?.statusmesa,
        });
      }
    },
    [user, empresa, idmovimento],
  );

  const totalPago = pagamentos.reduce(
    (soma, pagamento: any) => soma + (pagamento.valor || 0),
    0,
  );

  const mesaInfo = useMemo(
    () => ({
      statusmesa: route.params?.statusmesa,
      nummesa: route.params?.nummesa,
    }),
    [route.params],
  );

  const infoMesa = useMemo(
    () => ({
      mesa: route.params?.nummesa,
      total: dados.totalmovimento ?? 0,
      itens: itensmovimento,
      idusuario: user?.usuario,
      abertura: formatarData(dados.datamovimento),
      utilizacao: convertToHHMMSS(dados.tempoutilizacao),
      garcom: dados.nomefuncionario,
      taxa: dados.valorservicomesa ?? 0,
    }),
    [route.params, dados, itensmovimento, user?.usuario],
  );

  return (
    <View style={s.mainView}>
      <Cabecalho
        voltarFunction={() => {
          reset(Rotas.MapaMesas);
        }}
      />

      <ScrollView
        style={s.MainScrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!loadingMesa} // evita scroll enquanto overlay
      >
        <View style={s.CardsMesaView}>
          <CardNumMesa mesa={mesaInfo} />
          {dados.nomefornecedor ? (
            <CardParceiroSelecionado
              fornecedor={{
                tipofornecedor: dados.tipofornecedor ?? '',
                nome: dados.nomefornecedor ?? '',
                cnpj: dados.cnpjfornecedor ?? '',
              }}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (!idmovimento) {
                  Alert.alert(
                    'Alerta',
                    'A mesa deve primeiro ser aberta para depois selecionar o parceiro!',
                  );
                  return;
                }
                setvisibleModalFornecedor(true);
              }}>
              <CardParceiro />
            </TouchableOpacity>
          )}
        </View>

        {idmovimento ? (
          <View>
            <View style={s.ViewMesaInfo}>
              <CardMesaInfo.Cliente nome={dados.nomecliente} />
              <CardMesaInfo.Garcom nome={dados.nomefuncionario} />
              <CardMesaInfo.Abertura
                abertura={
                  dados.datamovimento ? formatarData(dados.datamovimento) : ''
                }
              />
              <CardMesaInfo.Utilizacao
                utilizacao={
                  dados.tempoutilizacao
                    ? convertToHHMMSS(dados.tempoutilizacao)
                    : ''
                }
              />
              <CardMesaInfo.Taxa taxa={dados.valorservicomesa ?? 0} />
              <CardMesaInfo.Consumacao
                consumacao={
                  dados.qtepessoasmesa
                    ? (dados.totalmovimento + (dados.valorservicomesa ?? 0)) /
                      dados.qtepessoasmesa
                    : 0
                }
              />
            </View>
            <CardMesaInfo.TotalMesa total={dados.totalmovimento ?? 0} />
          </View>
        ) : (
          <CardMesaDisponivel nummesa={route.params?.nummesa} />
        )}

        {idmovimento && (
          <CardTrasnfetirImprimir
            idmovimento={idmovimento}
            onPressTransferir={() => {
              if (!TRANSFERIR_ITENS_MESA) {
                Alert.alert("Erro:", "Usuário sem permissão para transferir itens da mesa.")
                return;
              }
              setshowmodalescolhernummesatransferir(true);
            }}
            info={infoMesa}
          />
        )}

        <CardItensMovimento
          onPressLupa={() => {
            reset(Rotas.ProdutosInserirMesaLupa, {
              idmovimento,
              nummesa: route?.params.nummesa,
              statusmesa: route.params.statusmesa,
            });
          }}
          itensmovimento={itensmovimento}
          onPressAddItem={() => {
            setCarrinho([]);
            reset(Rotas.GrupoMestre, {
              statusmesa: route.params?.statusmesa,
              nummesa: route.params?.nummesa,
              idmovimento: idmovimento,
            });
          }}
          onPressExcluir={removerItem}
        />
      </ScrollView>
      {idmovimento &&
      <View
        style={{
          paddingHorizontal: 10,
          borderWidth: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          paddingBottom: 10,
        }}>

        {/* Card de receber pagamento (SafraPay) */}
        
        <TouchableOpacity
          onPress={() => {
            setshowmodalreceberpagamento(true);
            carregarPagamentos();
          }}>
          <LinearGradient style={s.mainLinear} colors={['#2A64D0', '#99B0DC']}>
            <Text style={s.mainText}>Receber Pagamento</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Pagamentos: card com activity indicator quando carregando */}
      </View>}

      {/* Modal de seleção de parceiro */}
      <ModalSelecionarFornecedor
        visible={visibleModalFornecedor}
        onClose={() => {
          setvisibleModalFornecedor(false);
        }}
        idmovimento={idmovimento}
        nummesa={route?.params?.nummesa}
        statusmesa={route?.params?.statusmesa}
      />

      {/* Overlay de carregamento geral (mesa + itens) */}
      {loadingMesa && (
        <View style={s.loadingOverlay}>
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color="#2A64D0" />
            <Text style={s.loadingText}>Carregando dados da mesa...</Text>
          </View>
        </View>
      )}

      <Modal
        visible={showmodalreceberpagamento}
        animationType="fade"
        transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)', // opcional
          }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 12,
              width: '85%', // opcional
              maxHeight: '80%', // opcional
            }}>
            <TouchableOpacity
              style={styles.btnFechar}
              onPress={() => setshowmodalreceberpagamento(false)}>
              <Text style={styles.btnFecharText}>Cancelar</Text>
            </TouchableOpacity>

            {empresa?.geraparcelaversapospagamento === 'S' &&
              showpagamentosrecebidos &&
              idmovimento && (
                <>
                  {loadingPagamentos ? (
                    <View style={s.parcelasView}>
                      <Text style={s.parcelasTitle}>Pagamentos</Text>
                      <View style={{paddingVertical: 10, alignItems: 'center'}}>
                        <ActivityIndicator size="small" color="#2A64D0" />
                        <Text style={{marginTop: 4, fontSize: 12}}>
                          Carregando pagamentos...
                        </Text>
                      </View>
                    </View>
                  ) : (
                    pagamentos.length > 0 && (
                      <View style={s.parcelasView}>
                        <Text style={s.parcelasTitle}>Pagamentos</Text>
                        <View style={s.parcelasTitles}>
                          <Text style={s.parcelasTitlesText}>Id</Text>
                          <Text style={s.parcelasTitlesText}>Situação</Text>
                          <Text style={s.parcelasTitlesText}>Valor</Text>
                        </View>
                        {pagamentos.map((pagamento: any, index: any) => (
                          <View key={index} style={s.parcelaItemView}>
                            <Text style={s.parcelaItemText}>
                              {pagamento.idmovimentopagamento}
                            </Text>
                            <Text style={s.parcelaItemText}>Paga</Text>
                            <Text style={s.parcelaItemText}>
                              R$ {pagamento.valor.toFixed(2)}
                            </Text>
                          </View>
                        ))}
                        <View
                          style={[s.totalItenspagamentoView, {marginTop: 10}]}>
                          <Text
                            style={[
                              s.parcelaItemText,
                              s.texttotalizadorespagamento,
                            ]}>
                            Total pago:
                          </Text>
                          <Text style={s.textTotalpagamentos}>
                            R$ {String(totalPago.toFixed(2)).replace('.', ',')}
                          </Text>
                        </View>
                        <View
                          style={[s.totalItenspagamentoView, {marginTop: 10}]}>
                          <Text
                            style={[
                              s.parcelaItemText,
                              s.texttotalizadorespagamento,
                            ]}>
                            Total restante:
                          </Text>
                          <Text style={s.textTotalpagamentos}>
                            R${' '}
                            {String(
                              Number(
                                (
                                  (dados.totalmovimento ?? 0) - totalPago
                                ).toFixed(2),
                              ),
                            ).replace('.', ',')}
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </>
              )}

            <CardReceberPagamento
              total={Number(
                ((dados.totalmovimento ?? 0) - totalPago).toFixed(2),
              )}
              idmovimento={idmovimento}
              nummesa={route.params?.nummesa}
            />

            <TouchableOpacity
              onPress={() => {
                setpagamentoparcial(true);
              }}>
              <LinearGradient
                style={s.mainLinear}
                colors={['#2A64D0', '#99B0DC']}>
                <Text style={s.mainText}>Pagamento Parcial</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={pagamentoparcial} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            {/* Botão fechar */}
            <TouchableOpacity
              style={styles.btnFechar}
              onPress={() => setpagamentoparcial(false)}>
              <Text style={styles.btnFecharText}>Cancelar</Text>
            </TouchableOpacity>
            {/* <Text>{itensmovimento[0].codigobarras}</Text> */}
            
            <CardReceberPagamentoParcial
              itens={itensmovimento}
              idmovimento={idmovimento}
              nummesa={route.params.nummesa}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showmodalescolhernummesatransferir}
        animationType="slide"
        transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Transferir para a mesa:</Text>

            <TextInput
              style={styles.input}
              placeholder="Número da mesa"
              keyboardType="numeric"
              value={nummesatransferir}
              onChangeText={setnummesatransferir}
            />

            {/* BOTÕES */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancelar]}
                onPress={() => {
                  setshowmodalescolhernummesatransferir(false);
                  setnummesatransferir('');
                }}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnSalvar,
                  {backgroundColor: '#2A64D0'},
                ]}
                onPress={() => {
                  if (route.params?.nummesa == nummesatransferir) {
                    Alert.alert(
                      'Alerta:',
                      'Impossível transferir para a mesma mesa.',
                    );
                    return;
                  }

                  if (/^-?\d+$/.test(nummesatransferir)) {
                    
                  } else {
                     Alert.alert(
                      'Erro:',
                      'Número de mesa inválido',
                    );
                    return
                  }

                  setshowmodalescolhernummesatransferir(false);

                  reset(Rotas.TransferirMesa, {
                    itensmovimento: itensmovimento,
                    nummesaatual: route.params?.nummesa,
                    nummesatransferir: nummesatransferir,
                    idmovimento: idmovimento,
                  });
                }}>
                <Text style={styles.btnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  CardsMesaView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  mainLinear: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  mainText: {color: 'white', fontWeight: 'bold'},

  MainScrollView: {
    flex: 1,
    marginHorizontal: 10,
  },
  ViewMesaInfo: {
    marginTop: 10,
    marginBottom: 2,
  },
  ViewMesaInfoItem: {
    flexDirection: 'row',
    paddingBottom: 1,
    height: 30,
    marginTop: 1,
    paddingLeft: 3,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  imageIconInfoMesaItem1: {
    width: 20,
    height: 20,
  },
  imageIconInfoMesaItem2: {
    width: 21,
    height: 25,
  },
  imageIconInfoMesaItem3: {
    width: 20,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem4: {
    width: 20,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem5: {
    width: 17,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem6: {
    width: 20,
    height: 24,
    marginTop: 3,
  },
  imageiconiteminfomesawrapper: {
    width: 24,
  },
  textItemMesaInfo: {
    color: '#2A64D0',
  },
  parcelasView: {
    borderWidth: 1,
    paddingBottom: 10,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#e9e4cbff',
  },
  parcelasTitle: {
    alignSelf: 'center',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  parcelaItemView: {
    flexDirection: 'row',
    paddingLeft: 10,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 4,
  },
  parcelaItemText: {
    width: '33%',
  },
  parcelasTitles: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  parcelasTitlesText: {
    width: '33%',
  },
  totalItenspagamentoView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  textTotalpagamentos: {
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    width: '33%',
  },
  texttotalizadorespagamento: {
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
  },

  // overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  btnCancelar: {
    backgroundColor: '#aaa',
  },
  btnSalvar: {
    backgroundColor: '#28a745',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlayLoading: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxLoading: {
    backgroundColor: '#FFF',
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalBox: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  btnFechar: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    marginBottom: 10,
  },

  btnFecharText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Mesa;
