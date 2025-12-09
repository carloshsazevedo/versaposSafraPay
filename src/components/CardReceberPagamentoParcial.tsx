import React, {useEffect, useState} from 'react';
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

const returnScheme = 'reactnativeversapos'; // igual ao AndroidManifest

const CardPagamentoParcial = ({itens, idmovimento, nummesa}: any) => {
  const [selecionados, setSelecionados] = useState<any>({});

  useEffect(() => {
    const ini: any = {};
    itens.forEach((item: any) => {
      const prec =
        (item.preco)

      ini[item.iditemmovimento] = {
        selecionado: false,
        quantidadeSelecionada: item.quantidade,
        valorUnitario: prec,
        total: prec * item.quantidade,
      };
    });
    setSelecionados(ini);
  }, [itens]);

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

    let url = 'payment-app://pay?';

    url += 'amount=' + String(Number(totalPagar).toFixed(2)).replace('.', '');
    url += '&return_scheme=' + returnScheme;
    url += '&editable_amount=1';
    url += '&order_id=' + String(idmovimento) + '-' + String(nummesa);

    console.log('🟦 Enviando pagamento parcial:', url);

    try {
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Erro ao abrir deeplink', String(err));
      console.log('Erro deeplink:', err);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.titulo}>Pagamento Parcial</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={{height: '60%'}}>
        {itens.map((item: any) => {
          const sel = selecionados[item.iditemmovimento];
          if (!sel) return null;

          return (
            <View key={item.iditemmovimento} style={s.itemBox}>
              <TouchableOpacity
                style={s.headerLinha}
                onPress={() => toggleSelecionado(item.iditemmovimento)}>
                <View
                  style={[s.checkbox, sel.selecionado && s.checkboxMarcado]}
                />

                <View>
                  <Text style={s.nomeProduto}>{item.nomeproduto}</Text>
                  <Text>Qtd: {item.quantidade}</Text>
                </View>
              </TouchableOpacity>

              {sel.selecionado && (
                <>
                  <View style={s.linha}>
                    <Text style={s.label}>
                      Qtd. original: {item.quantidade}
                    </Text>
                  </View>

                  <View style={s.linha}>
                    <Text style={s.label}>Qtd. a pagar:</Text>

                    <View style={s.qtdControls}>
                      <TouchableOpacity
                        style={s.btnQtd}
                        onPress={() =>
                          alterarQuantidade(item.iditemmovimento, item, -1)
                        }>
                        <Text style={s.btnQtdTxt}>−</Text>
                      </TouchableOpacity>

                      <Text style={s.qtdValor}>
                        {sel.quantidadeSelecionada}
                      </Text>

                      <TouchableOpacity
                        style={s.btnQtd}
                        onPress={() =>
                          alterarQuantidade(item.iditemmovimento, item, +1)
                        }>
                        <Text style={s.btnQtdTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={s.linha}>
                    <Text style={s.label}>Total do item:</Text>

                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={{marginRight: 4}}>R$</Text>

                      <TextInput
                        style={s.inputValor}
                        keyboardType="numeric"
                        value={sel.total === '' ? '' : String(Number(sel.total).toFixed(2))}
                        onChangeText={txt => {
                          // Permite campo vazio
                          if (txt.trim() === '') {
                            alterarValorTotal(item.iditemmovimento, '');
                            return;
                          }

                          // Substitui vírgula por ponto
                          const normalizado = txt.replace(',', '.');

                          // Aceita números parcials, ex: "12.", "0.", etc.
                          if (/^[0-9]*\.?[0-9]*$/.test(normalizado)) {
                            alterarValorTotal(
                              item.iditemmovimento,
                              normalizado,
                            );
                          }
                        }}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={s.totalBox}>
        <Text style={s.totalTxt}>
          Total a pagar: R$ {Number(totalPagar).toFixed(2)}
        </Text>
      </View>

      {/* BOTÃO PAGAR PARCIAL */}
      <TouchableOpacity style={s.btn} onPress={enviarPagamentoParcial}>
        
          <CardReceberPagamento
              total={Number(totalPagar)}
              idmovimento={idmovimento}
              nummesa={nummesa}
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
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
