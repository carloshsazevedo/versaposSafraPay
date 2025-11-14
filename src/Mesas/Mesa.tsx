import {
  Alert,
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
import { useCallback, useEffect, useState } from 'react';
import { CardMesaInfo } from '../components/CardsMesaInfo';
import CardMesaDisponivel from '../components/CardMesaDisponível';
import CardItensMovimento from '../components/CardItensMovimento';
import CardTrasnfetirImprimir from '../components/CardTrasnfetirImprimir';
import Rotas from '../Rotas/Rotas';
import { useUser } from '../Context/userContext';
import {
  ConsultaFornecedor,
  ItemmovimentoPesquisaitemmovimentocomandas,
  ConsultaMovimentoPagamento,
  RemoveItemMovimento,
} from '../API/api_rotas';
import { useEmpresa } from '../Context/empresaContext';
import CardReceberPagamento from '../components/CardReceberPagamento';
import { reset } from '../Rotas/NavigatorContainerRef';
import { useCarrinho } from '../Context/carrinhoContext';
import ModalSelecionarFornecedor from '../components/ModalSelecionarFornecedor';

const Mesa = ({ route }: any) => {
  const { setCarrinho } = useCarrinho();
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
  // const [totalMesaParcial, settotalMesaParcial] = useState(0.0);
  const { user } = useUser();
  const { empresa } = useEmpresa();

  const [itensmovimento, setitensmovimento] = useState([] as any[]);

  // formatar data "2025-09-26T13:45:00.000Z" em "26/09/2025 13:45"
  const formatarData = useCallback((dataString: any) => {
    const data = new Date(dataString);

    const adicionarZero = (numero: number) =>
      numero < 10 ? `0${numero}` : numero;

    const dia = adicionarZero(data.getUTCDate());
    const mes = adicionarZero(data.getUTCMonth() + 1);
    const ano = data.getUTCFullYear();
    const horas = adicionarZero(data.getUTCHours());
    const minutos = adicionarZero(data.getUTCMinutes());

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  }, []);

  const convertToHHMMSS = useCallback((decimalTime: any) => {
    // Converte a parte decimal (dias) para horas
    const totalSeconds = Math.floor(decimalTime * 24 * 3600); // 24 hours * 3600 seconds

    const hours = Math.floor(totalSeconds / 3600); // Converte para horas
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Converte o restante para minutos
    const seconds = totalSeconds % 60; // O restante para segundos

    // Formata para HH:MM:SS
    const formattedTime = [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ].join(':');

    return formattedTime;
  }, []);

  const [pagamentos, setpagamentos] = useState([]);
  const [visibleModalFornecedor, setvisibleModalFornecedor] = useState(false);

  useEffect(() => {
    async function getParams() {
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const idempresa = empresa?.idparametro;
      const tipomovimento = empresa?.tipomovimentomesascomandas;

      if (servername && serverport && pathbanco && idempresa && idmovimento) {
        const result = await ConsultaFornecedor({
          serverport: serverport,
          servername: servername,
          pathbanco: pathbanco,
          idmovimento: idmovimento,
          idempresa: empresa?.idparametro,
        });

        setNomeCliente(result.data[0].nomeCliente);
        setnomeFornecedor(
          result.data[0].nomefornecedor ? result.data[0].nomefornecedor : '',
        );
        setcnpjFornecedor(
          result.data[0].cnpjfornecedor ? result.data[0].cnpjfornecedor : '',
        );
        settipoFornecedor(
          result.data[0].tipofornecedor ? result.data[0].tipofornecedor : '',
        );
        setnomeGarcom(result.data[0].nomefuncionario);
        setdataAbertura(formatarData(result.data[0].datamovimento));
        settempoUtilizacao(convertToHHMMSS(result.data[0].tempoutilizacao));
        setTaxa(
          result.data[0].valorservicomesa ? result.data[0].valorservicomesa : 0,
        );
        setConsumacao(
          result.data[0].qtepessoasmesa
            ? (result.data[0].totalmovimento +
                (result.data[0].valorservicomesa
                  ? result.data[0].valorservicomesa
                  : 0)) /
                result.data[0].qtepessoasmesa
            : 0,
        );
        settotalMesa(
          result.data[0].totalmovimento ? result.data[0].totalmovimento : 0,
        );
        // settotalMesaParcial(result.data[0].totalmovimentobruto ? result.data[0].totalmovimentobruto : 0)

        const result2 = await ItemmovimentoPesquisaitemmovimentocomandas({
          servername: servername,
          serverport: serverport,
          pathbanco: pathbanco,
          idmovimento: idmovimento,
          tipomovimento: tipomovimento,
          idempresa: idempresa,
        });

        // Alert.alert('Resultado:', JSON.stringify(result2.data));

        setitensmovimento(result2.data);

        if (empresa.geraparcelaversapospagamento === 'S') {
          const result3 = await ConsultaMovimentoPagamento({
            serverport: serverport,
            servername: servername,
            pathbanco: pathbanco,
            idmovimento: idmovimento,
            idempresa: idempresa,
          });

          // Alert.alert("pagamentos retornados:", JSON.stringify(result3.data))
          setpagamentos(result3.data);
        }
      }
    }

    getParams();
  }, [route.params?.data]);

  async function removerItem(iditemmovimento: any) {
    console.log('Função ativada!');

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

    if (resultado){}
    const dataenviar = new Date()

    reset(Rotas.Mesa, {
      idmovimento: idmovimento,
      nummesa: route?.params?.nummesa,
      data: `${dataenviar}`,
      statusmesa: route?.params?.statusmesa,
    });
  }

  return (
    <View style={s.mainView}>
      {/* <Text></Text> */}

      <Cabecalho
        voltarFunction={() => {
          reset(Rotas.MapaMesas);
        }}
      />

      <ScrollView
        style={s.MainScrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
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
              }}
            >
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

            <CardReceberPagamento
              total={Number((
                  totalMesa -
                  pagamentos.reduce(
                    (soma, pagamento: any) => soma + pagamento.valor,
                    0,
                  )
                ).toFixed(2))}
              idmovimento={idmovimento}
              nummesa={route.params?.nummesa}
            />
       

            {/* <Text>
              {String(
                (
                  totalMesa -
                  pagamentos.reduce(
                    (soma, pagamento: any) => soma + pagamento.valor,
                    0,
                  )
                ).toFixed(2),
              ).replace('.', '')}
            </Text> */}
            {pagamentos.length > 0 && (
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
                <View style={[s.totalItenspagamentoView, { marginTop: 10 }]}>
                  <Text
                    style={[s.parcelaItemText, s.texttotalizadorespagamento]}
                  >
                    Total pago:
                  </Text>
                  <Text style={s.textTotalpagamentos}>
                    R${' '}
                    {String(
                      pagamentos
                        .reduce(
                          (soma, pagamento: any) => soma + pagamento.valor,
                          0,
                        )
                        .toFixed(2),
                    ).replace('.', ',')}
                  </Text>
                </View>
                <View style={[s.totalItenspagamentoView, { marginTop: 10 }]}>
                  <Text
                    style={[s.parcelaItemText, s.texttotalizadorespagamento]}
                  >
                    Total restante:
                  </Text>
                  <Text style={s.textTotalpagamentos}>
                    R${' '}
                    {String(
                      (
                        totalMesa -
                        pagamentos.reduce(
                          (soma, pagamento: any) => soma + pagamento.valor,
                          0,
                        )
                      ).toFixed(2),
                    ).replace('.', ',')}
                  </Text>
                </View>
              </View>
            )}
            {/* <Text>{String(totalMesa.toFixed(2)).replace('.','')}</Text> */}
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

      <ModalSelecionarFornecedor
        visible={visibleModalFornecedor}
        onClose={() => {
          setvisibleModalFornecedor(false);
        }}
        idmovimento={idmovimento}
        nummesa={route?.params?.nummesa}
        statusmesa={route?.params?.statusmesa}
      />
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
});

export default Mesa;
