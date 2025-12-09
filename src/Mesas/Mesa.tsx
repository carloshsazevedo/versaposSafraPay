import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Cabecalho from '../components/Cabecalho';
import CardNumMesa from '../components/CardNumMesa';
import CardParceiro from '../components/CardParceiro';
import CardParceiroSelecionado from '../components/CardParceiroSelecionado';
import {useCallback, useEffect, useState} from 'react';
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

const Mesa = ({route}: any) => {
  const {setCarrinho} = useCarrinho();
  const [nomeFornecedor, setnomeFornecedor] = useState('');
  const [tipoFornecedor, settipoFornecedor] = useState('');
  const [cnpjFornecedor, setcnpjFornecedor] = useState('');
  const [idmovimento] = useState(route.params?.idmovimento);
  const [nomeCliente, setNomeCliente] = useState('');
  const [nomeGarcom, setnomeGarcom] = useState('');
  const [dataAbertura, setdataAbertura] = useState('');
  const [tempoUtilizacao, settempoUtilizacao] = useState('');
  const [Taxa, setTaxa] = useState(0.0);
  const [Consumacao, setConsumacao] = useState(0.0);
  const [totalMesa, settotalMesa] = useState(0.0);
  const {user} = useUser();
  const {empresa} = useEmpresa();

  const [pagamentoparcial, setpagamentoparcial] = useState(false);

  const [itensmovimento, setitensmovimento] = useState([] as any[]);

  const [pagamentos, setpagamentos] = useState<any[]>([]);
  const [visibleModalFornecedor, setvisibleModalFornecedor] = useState(false);

  // flags de loading
  const [loadingMesa, setLoadingMesa] = useState(false);
  const [loadingPagamentos, setLoadingPagamentos] = useState(false);

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

  useEffect(() => {
    async function getParams() {
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
        setLoadingPagamentos(false);

        // --- Consulta principal da mesa / cabeçalho ---
        const result = await ConsultaFornecedor({
          serverport: serverport,
          servername: servername,
          pathbanco: pathbanco,
          idmovimento: idmovimento,
          idempresa: idempresa,
        });

        const dados = result.data?.[0];

        if (!dados) {
          Alert.alert('Atenção', 'Não foi possível carregar os dados da mesa.');
          return;
        }

        setNomeCliente(dados.nomeCliente);
        setnomeFornecedor(dados.nomefornecedor ? dados.nomefornecedor : '');
        setcnpjFornecedor(dados.cnpjfornecedor ? dados.cnpjfornecedor : '');
        settipoFornecedor(dados.tipofornecedor ? dados.tipofornecedor : '');
        setnomeGarcom(dados.nomefuncionario);
        setdataAbertura(formatarData(dados.datamovimento));
        settempoUtilizacao(convertToHHMMSS(dados.tempoutilizacao));
        setTaxa(dados.valorservicomesa ? dados.valorservicomesa : 0);

        setConsumacao(
          dados.qtepessoasmesa
            ? (dados.totalmovimento +
                (dados.valorservicomesa ? dados.valorservicomesa : 0)) /
                dados.qtepessoasmesa
            : 0,
        );

        settotalMesa(dados.totalmovimento ? dados.totalmovimento : 0);

        // --- Itens da mesa ---
        const result2 = await ItemmovimentoPesquisaitemmovimentocomandas({
          servername: servername,
          serverport: serverport,
          pathbanco: pathbanco,
          idmovimento: idmovimento,
          tipomovimento: tipomovimento,
          idempresa: idempresa,
        });

        setitensmovimento(result2.data ?? []);

        // --- Pagamentos (sem overlay global, só card com spinner) ---
        if (empresa?.geraparcelaversapospagamento === 'S') {
          try {
            setLoadingPagamentos(true);

            const result3 = await ConsultaMovimentoPagamento({
              serverport: serverport,
              servername: servername,
              pathbanco: pathbanco,
              idmovimento: idmovimento,
              idempresa: idempresa,
            });

            setpagamentos(result3.data ?? []);
          } finally {
            setLoadingPagamentos(false);
          }
        } else {
          setpagamentos([]);
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados da mesa:', error);
        Alert.alert(
          'Erro',
          'Ocorreu um problema ao carregar os dados da mesa. Tente novamente.',
        );
      } finally {
        setLoadingMesa(false);
      }
    }

    getParams();
  }, [route.params?.data]);

  async function removerItem(iditemmovimento: any) {
    console.log('Função removerItem ativada!');

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
  }

  const totalPago = pagamentos.reduce(
    (soma, pagamento: any) => soma + (pagamento.valor || 0),
    0,
  );
  const totalRestante = Number((totalMesa - totalPago).toFixed(2));

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
          <CardNumMesa
            mesa={{
              statusmesa: route.params?.statusmesa,
              nummesa: route.params?.nummesa,
            }}
          />
          {nomeFornecedor ? (
            <CardParceiroSelecionado
              fornecedor={{
                tipofornecedor: tipoFornecedor,
                nome: nomeFornecedor,
                cnpj: cnpjFornecedor,
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
              <CardMesaInfo.Cliente nome={nomeCliente} />
              <CardMesaInfo.Garcom nome={nomeGarcom} />
              <CardMesaInfo.Abertura abertura={dataAbertura} />
              <CardMesaInfo.Utilizacao utilizacao={tempoUtilizacao} />
              <CardMesaInfo.Taxa taxa={Taxa} />
              <CardMesaInfo.Consumacao consumacao={Consumacao} />
            </View>
            <CardMesaInfo.TotalMesa total={totalMesa} />

            {/* Card de receber pagamento (SafraPay) */}
            <CardReceberPagamento
              total={totalRestante}
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

            {/* Pagamentos: card com activity indicator quando carregando */}
            {empresa?.geraparcelaversapospagamento === 'S' && (
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
                          {String(totalRestante.toFixed(2)).replace('.', ',')}
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </>
            )}
          </View>
        ) : (
          <CardMesaDisponivel nummesa={route.params?.nummesa} />
        )}

        {idmovimento && (
          <CardTrasnfetirImprimir
            idmovimento={idmovimento}
            onPressTransferir={() => {}}
            info={{
              mesa: route.params?.nummesa,
              total: totalMesa,
              itens: itensmovimento,
              idusuario: user?.usuario,
              abertura: dataAbertura,
              utilizacao: tempoUtilizacao,
              garcom: nomeGarcom,
              taxa: Taxa,
            }}
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


      <Modal visible={pagamentoparcial} animationType="fade" transparent>
  <View style={styles.overlay}>
    <View style={styles.modalBox}>

      {/* Botão fechar */}
      <TouchableOpacity style={styles.btnFechar} onPress={() => setpagamentoparcial(false)}>
        <Text style={styles.btnFecharText}>Cancelar</Text>
      </TouchableOpacity>

      
        <CardReceberPagamentoParcial
          itens={itensmovimento}
          idmovimento={idmovimento}
          nummesa={route.params.nummesa}
      
        />
      

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
