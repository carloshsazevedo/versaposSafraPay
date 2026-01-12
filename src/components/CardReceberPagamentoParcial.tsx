import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CardReceberPagamento from './CardReceberPagamento';
import SwitchCustom from './Switch';
import {ConsultaImtemmovimentopago} from '../API/api_rotas';
import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';

const returnScheme = 'reactnativeversapos'; // igual ao AndroidManifest

const CardPagamentoParcial = ({itens, idmovimento, nummesa}: any) => {
  const [selecionados, setSelecionados] = useState<any>({});
  const [itensPagos, setitensPagos] = useState([]);
  const {user} = useUser();
  const {empresa} = useEmpresa();

  const itensAgrupados = React.useMemo(
    () => agruparPorIdProduto(itens),
    [itens],
  );

  const listaSelecionados = useMemo(() => {
    return Object.entries(selecionados)
      .filter(([_, produto]: any) => produto.selecionado)
      .map(([idproduto, produto]: any) => ({
        idproduto: Number(idproduto),
        quantidade: produto.quantidadeSelecionada,
      }));
  }, [selecionados]);

  useEffect(() => {
    async function getParams() {
      const result = await ConsultaImtemmovimentopago({
        servername: user.servername,
        serverport: user.serverport,
        pathbanco: user.pathbanco,
        idempresa: empresa?.idparametro,
        idmovimento,
      });

      setitensPagos(result.data);
    }

    getParams();
  }, []);

  function agruparPorIdProduto(lista: any) {
    const mapa = {} as any;

    for (const item of lista) {
      const id = item.idproduto;

      if (!mapa[id]) {
        mapa[id] = {
          codigobarras: item.codigobarras,
          idmovimento: item.idmovimento,
          idproduto: item.idproduto,
          nomeproduto: item.nomeproduto,
          preco: item.preco,
          precooriginal: item.precooriginal,
          quantidade: 0,
          totalitem: 0,
          valoracrescimo: 0,
          valordesconto: 0,
          iditemmovimento: [],
        };
      }

      mapa[id].quantidade += item.quantidade || 0;
      mapa[id].totalitem += item.totalitem || 0;
      mapa[id].valoracrescimo += item.valoracrescimo || 0;
      mapa[id].valordesconto += item.valordesconto || 0;
      mapa[id].iditemmovimento.push(item.iditemmovimento);
    }

    return Object.values(mapa);
  }

  useEffect(() => {
    const ini: any = {};

    itensAgrupados.forEach((item: any) => {
      const preco = Number(item.preco) || 0;

      const itemPago = itensPagos?.find(
        (pago: any) => pago.idproduto === item.idproduto,
      ) as any;

      ini[item.idproduto] = {
        selecionado: false,
        quantidadeSelecionada: item.quantidade - (itemPago ? itemPago.qtdpaga : 0),
        valorUnitario: preco,
        total: preco * (item.quantidade - (itemPago ? itemPago.qtdpaga : 0)),
      };
    });

    setSelecionados(ini);
  }, [itensAgrupados, itensPagos]);

  function toggleSelecionado(id: number) {
    setSelecionados({
      ...selecionados,
      [id]: {
        ...selecionados[id],
        selecionado: !selecionados[id].selecionado,
      },
    });
  }

  function formatarParaBRL(valor: number) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function limparMascara(txt: string) {
    if (!txt) return '';
    return txt.replace(/[R$\s\.]/g, '').replace(',', '.');
  }
  function alterarQuantidade(id: number, item: any, delta: number) {
    let nova = selecionados[id].quantidadeSelecionada + delta;

    if (nova < 1) nova = 1;
    if (nova > item.quantidade) nova = item.quantidade;

    const precoUnit = selecionados[id].valorUnitario;

    setSelecionados({
      ...selecionados,
      [id]: {
        ...selecionados[id],
        quantidadeSelecionada: nova,
        total: precoUnit * nova,
      },
    });
  }

  function alterarValorTotal(id: number, texto: string) {
    setSelecionados({
      ...selecionados,
      [id]: {
        ...selecionados[id],
        total: texto,
      },
    });
  }

  // TOTAL PARCIAL
  const totalPagar = Object.values(selecionados).reduce(
    (acum: any, item: any) =>
      item.selecionado ? acum + Number(item.total || 0) : acum,
    0,
  );

  // ⮕ PAGAMENTO VIA DEEPLINK
  async function enviarPagamentoParcial() {
    if (Number(totalPagar) <= 0) {
      Alert.alert('Selecione ao menos 1 item para pagar.');
      return;
    }
  }

  function toggleSelecionarTodos() {
    const todosSelecionados = Object.values(selecionados).every(
      (item: any) => item.selecionado === true,
    );

    const novo: any = {};

    Object.keys(selecionados).forEach(idproduto => {
      novo[idproduto] = {
        ...selecionados[idproduto],
        selecionado: !todosSelecionados,
      };
    });

    setSelecionados(novo);
  }

  return (
    <View style={s.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={s.titulo}>Pagamento Parcial</Text>
        <SwitchCustom onChange={toggleSelecionarTodos} />
      </View>
      {/* <TouchableOpacity
        style={s.btnSelecionarTodos}
        onPress={toggleSelecionarTodos}>
        <Text style={s.btnSelecionarTodosTxt}>
          {Object.values(selecionados).every((item: any) => item.selecionado)
            ? 'Desmarcar todos'
            : 'Selecionar todos'}
        </Text>
      </TouchableOpacity> */}

      <ScrollView showsVerticalScrollIndicator={false} style={{height: '60%'}}>
        {itensAgrupados.map((item: any) => {
          const sel = selecionados[item.idproduto];
          if (!sel) return null;

          const itemPago = itensPagos?.find(
            (pago: any) => pago.idproduto === item.idproduto,
          ) as any;

          return (
            <View key={item.idproduto} style={s.itemBox}>
              <TouchableOpacity
                style={s.headerLinha}
                onPress={() => toggleSelecionado(item.idproduto)}>
                <View
                  style={[s.checkbox, sel.selecionado && s.checkboxMarcado]}>
                  {sel.selecionado && <Text style={s.checkIcon}>✓</Text>}
                </View>

                <View>
                  <Text style={s.nomeProduto}>{item.nomeproduto}</Text>
                  <Text>Qtd total: {item.quantidade}</Text>
                  {itemPago && (
                    <View style={{flexDirection: 'row', flex: 1}}>
                      <Text>Qtd paga:</Text>
                      <Text
                        style={{
                          backgroundColor: '#93d882',
                          color: 'white',
                          borderRadius: 10,
                          fontWeight: 'bold',
                          paddingHorizontal: 4,
                          marginRight: 5,
                        }}>
                        {itemPago ? itemPago.qtdpaga : 0}
                      </Text>
                      <Text>
                        Garçom: {itemPago ? itemPago.usuariopagamento : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {sel.selecionado && (
                <>
                  <View style={s.linha}>
                    <Text style={s.label}>Qtd. a pagar:</Text>

                    <View style={s.qtdControls}>
                      <TouchableOpacity
                        style={s.btnQtd}
                        onPress={() =>
                          alterarQuantidade(item.idproduto, item, -1)
                        }>
                        <Text style={s.btnQtdTxt}>−</Text>
                      </TouchableOpacity>

                      <Text style={s.qtdValor}>
                        {sel.quantidadeSelecionada}
                      </Text>

                      <TouchableOpacity
                        style={s.btnQtd}
                        onPress={() =>
                          alterarQuantidade(item.idproduto, item, +1)
                        }>
                        <Text style={s.btnQtdTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={s.linha}>
                    <Text style={s.label}>Total do item:</Text>

                    <TextInput
                    editable={false}
                      style={s.inputValor}
                      keyboardType="numeric"
                      value={
                        sel.total === ''
                          ? ''
                          : String(Number(sel.total).toFixed(2))
                      }
                      onChangeText={txt =>
                        alterarValorTotal(item.idproduto, txt)
                      }
                    />
                  </View>
                </>
              )}
            </View>
          );
        })}
        {/* <Text>{itensAgrupados.length}</Text>
        <View style={{backgroundColor: '#dce79f', padding: 10}}>
          {itensAgrupados.map((item: any) => (
            <View
              style={{
                marginBottom: 5,
                borderBottomColor: 'black',
                borderBottomWidth: 1,
              }}>
              <Text>{JSON.stringify(item)}</Text>
            </View>
          ))}
        </View> */}

        {/* <View style={{backgroundColor: '#acb3dd', padding: 10}}>
          {agruparPorIdProduto(itens).map(item => (
            <View
              style={{
                marginBottom: 5,
                borderBottomColor: 'black',
                borderBottomWidth: 1,
              }}>
              <Text>{JSON.stringify(item)}</Text>
            </View>
          ))}
        </View> */}

        {/* <Text style={{backgroundColor: '#ee9e70'}}>
          {JSON.stringify(listaSelecionados)}
        </Text>
        <Text></Text> */}
      </ScrollView>

      <View style={s.totalBox}>
        <Text style={s.totalTxt}>
          Total a pagar: R$ {String(Number(totalPagar).toFixed(2)).replace('.',',')}
        </Text>
      </View>

      {/* BOTÃO PAGAR PARCIAL */}
      <TouchableOpacity style={s.btn} onPress={enviarPagamentoParcial}>
        <CardReceberPagamento
          total={Number(totalPagar)}
          idmovimento={idmovimento}
          nummesa={nummesa}
          ids={listaSelecionados}
          blockedit={true}
        />
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    marginTop: 10,
  },
  btnSelecionarTodos: {
    backgroundColor: '#2A64D0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  btnSelecionarTodosTxt: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
  },

  itemBox: {
    backgroundColor: '#FFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },

  headerLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 6,
    marginRight: 10,
  },
  checkboxMarcado: {
    backgroundColor: '#2A64D0',
    borderColor: '#2A64D0',
  },

  nomeProduto: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },

  label: {
    fontSize: 14,
  },

  qtdControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  btnQtd: {
    padding: 6,
    backgroundColor: '#DDD',
    borderRadius: 6,
    marginHorizontal: 5,
  },
  btnQtdTxt: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  qtdValor: {
    fontSize: 18,
    width: 35,
    textAlign: 'center',
  },

  inputValor: {
    backgroundColor: '#EEE',
    padding: 5,
    width: 100,
    textAlign: 'center',
    borderRadius: 8,
  },

  totalBox: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
  },

  totalTxt: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  btn: {
    marginTop: 15,
    width: '100%',
  },
  btnGrad: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default React.memo(CardPagamentoParcial);
