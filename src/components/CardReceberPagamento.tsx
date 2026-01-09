import React, {useState} from 'react';
import {
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';
import {
  CadastroItemmovimentoPago,
  CadastroMovimentoPagamento,
} from '../API/api_rotas';
import {reset} from '../Rotas/NavigatorContainerRef';
import Rotas from '../Rotas/Rotas';

import {
  vendaCreditoSafra,
  SafraTransactionResult,
  vendaCreditoParcSemJurosSafra,
  vendaDebitoSafra,
  vendaPixSafra,
  vendaQRCodeSafra,
  vendaVoucherSafra,
} from '../native/safrapay';

type Props = {
  total: number;
  idmovimento: string | number;
  nummesa: string | number;
  ids?: any[];
};

type PaymentMethodKey =
  | 'CREDITO_AVISTA'
  | 'CREDITO_PARC_SEM_JUROS'
  | 'DEBITO'
  | 'PIX'
  | 'QRCODE'
  | 'VOUCHER';

type PaymentMethodOption = {
  key: PaymentMethodKey;
  label: string;
  description?: string;
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    key: 'CREDITO_AVISTA',
    label: 'Crédito à vista',
    description: 'Pagamento em uma vez no crédito.',
  },
  {
    key: 'CREDITO_PARC_SEM_JUROS',
    label: 'Crédito parcelado (sem juros)',
    description: 'Parcelamento com juros assumidos pelo estabelecimento.',
  },
  {
    key: 'DEBITO',
    label: 'Débito',
    description: 'Pagamento direto na conta do cliente.',
  },
  {
    key: 'PIX',
    label: 'PIX',
    description: 'Pagamento via PIX no terminal SafraPay.',
  },
  {
    key: 'QRCODE',
    label: 'QR Code',
    description: 'Venda via QR Code (Safra / Auxílio / Elo / PIX).',
  },
  {
    key: 'VOUCHER',
    label: 'Voucher',
    description: 'Alimentação / refeição conforme habilitado na maquininha.',
  },
];

const CardReceberPagamento: React.FC<Props> = ({
  total,
  idmovimento,
  nummesa,
  ids,
}) => {
  const {user} = useUser();
  const {empresa} = useEmpresa();

  const [loading, setLoading] = useState(false);

  // Modal 1 – valor
  const [modalValorVisible, setModalValorVisible] = useState(false);
  const [amountText, setAmountText] = useState(
    total.toFixed(2).replace('.', ','),
  );

  // Valor já validado que será enviado ao SafraPay (em reais)
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);

  // Modal 2 – forma de pagamento
  const [modalFormaVisible, setModalFormaVisible] = useState(false);

  /**
   * Mapeia a forma selecionada para o idformapagtodfe usado no backend.
   * Ajuste aqui conforme a sua tabela de formas:
   *  3 = crédito, 4 = débito, 17 = pix, outros = 99 (exemplo).
   */
  function mapFormaPagamentoToId(method: PaymentMethodKey): string {
    switch (method) {
      case 'CREDITO_AVISTA':
      case 'CREDITO_PARC_SEM_JUROS':
        return '3'; // crédito
      case 'DEBITO':
        return '4'; // débito
      case 'PIX':
        return '17'; // pix
      case 'QRCODE':
      case 'VOUCHER':
      default:
        return '99'; // outros / genérico
    }
  }

  /**
   * Converte texto digitado (pt-BR: vírgula, ponto de milhar) para número.
   * Ex.: "120,50" -> 120.5   |  "1.234,56" -> 1234.56
   */
  function parseAmount(text: string): number {
    if (!text) return 0;

    let t = text.trim();

    // Se tiver vírgula, assume que vírgula é decimal
    if (t.includes(',')) {
      // remove pontos de milhar, ex.: 1.234,56 → 1234,56
      t = t.replace(/\./g, '');
      // vírgula decimal → ponto
      t = t.replace(',', '.');
      const n = Number(t);
      return isNaN(n) ? 0 : n;
    }

    // Se NÃO tiver vírgula, mas tiver ponto → assume ponto como decimal
    if (t.includes('.')) {
      const n = Number(t);
      return isNaN(n) ? 0 : n;
    }

    // Caso seja somente número inteiro
    const n = Number(t);
    return isNaN(n) ? 0 : n;
  }

  async function registrarPagamentoBackend(
    orderId: string,
    result: SafraTransactionResult,
    method: PaymentMethodKey,
    amountValue: number, // em reais
  ) {
    const [idmov, mesa] = orderId.split('-');

    const idformapagtodfe = mapFormaPagamentoToId(method);

    const res = await CadastroMovimentoPagamento({
      idusuario: user.usuario,
      servername: user.servername,
      serverport: user.serverport,
      pathbanco: user.pathbanco,
      idempresa: empresa?.idparametro,

      order_id: idmov,
      amount: String(Math.round(amountValue * 100)), // em centavos
      gateway: 'SAFRAPAY',
      idformapagtodfe,
      resultado_safra: result.raw,
    });

    console.log(
      'Retorno do cadastro movimentopagamento: ',
      JSON.stringify(res),
    );

    if (ids){
    const resultado = await CadastroItemmovimentoPago({
      idmovimento,
      lista: ids,
      servername: user.servername,
      serverport: user.serverport,
      pathbanco: user.pathbanco,
      idempresa: empresa?.idparametro,
      idusuario: user.usuario
    });
    }

    const dataenviar = new Date();

    reset(
      Rotas.Mesa as never,
      {
        idmovimento: idmov,
        nummesa: mesa,
        data: `${dataenviar}`,
        statusmesa: 'O',
      } as never,
    );
  }

  /**
   * Confirma o valor digitado no primeiro modal e abre o segundo (formas).
   */
  function confirmarValor() {
    const valor = parseAmount(amountText);

    if (!valor || valor <= 0) {
      Alert.alert(
        'Valor inválido',
        'Informe um valor maior que zero para receber o pagamento.',
      );
      return;
    }

    if (valor > total + 0.0001) {
      Alert.alert(
        'Valor acima do total',
        'O valor informado é maior que o total da conta.',
      );
      return;
    }

    setValorSelecionado(valor);
    setModalValorVisible(false);
    Keyboard.dismiss();

    // abre modal de forma de pagamento
    setModalFormaVisible(true);
  }

  /**
   * Faz a chamada SafraPay correspondente ao método escolhido.
   * Usa o valorSelecionado (já validado no modal 1).
   */
  async function processarPagamento(method: PaymentMethodKey) {
    if (valorSelecionado == null || valorSelecionado <= 0) {
      Alert.alert(
        'Valor não definido',
        'Informe o valor a receber antes de escolher a forma de pagamento.',
      );
      return;
    }

    try {
      setLoading(true);
      setModalFormaVisible(false);

      const valor = valorSelecionado;

      console.log('CardReceberPagamento: iniciando venda SafraPay...');
      const orderId = `${idmovimento}-${nummesa}`;
      console.log('orderId:', orderId);
      console.log('total da conta:', total);
      console.log('valor a receber agora:', valor);

      let result: SafraTransactionResult;

      switch (method) {
        case 'CREDITO_AVISTA':
          result = await vendaCreditoSafra(valor, orderId);
          break;
        case 'CREDITO_PARC_SEM_JUROS':
          result = await vendaCreditoParcSemJurosSafra(valor, orderId);
          break;
        case 'DEBITO':
          result = await vendaDebitoSafra(valor, orderId);
          break;
        case 'PIX':
          result = await vendaPixSafra(valor, orderId);
          break;
        case 'QRCODE':
          result = await vendaQRCodeSafra(valor, orderId);
          break;
        case 'VOUCHER':
          result = await vendaVoucherSafra(valor, orderId);
          break;
        default:
          throw new Error('Forma de pagamento não suportada.');
      }

      console.log('SafraPay retorno:', result);

      if (!result.sucesso) {
        Alert.alert(
          'Falha no pagamento SafraPay',
          result.raw || 'Transação não aprovada',
        );
        return;
      }

      Alert.alert(
        'Pagamento aprovado SafraPay!',
        `Valor recebido: R$ ${valor.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
        })}`,
      );

      await registrarPagamentoBackend(orderId, result, method, valor);
    } catch (err: any) {
      console.error('Erro ao processar pagamento SafraPay:', err);
      Alert.alert(
        'Erro ao processar pagamento SafraPay',
        err?.message || String(err),
      );
    } finally {
      setLoading(false);
    }
  }

  function abrirModalValor() {
    if (total <= 0) {
      Alert.alert('Impossível receber valor menor ou igual a zero!');
      return;
    }

    if (loading) return;
    // sempre que abrir, sincroniza o valor padrão com o total
    setAmountText(total.toFixed(2).replace('.', ','));
    setValorSelecionado(null);
    setModalValorVisible(true);
  }

  function fecharModalValor() {
    if (loading) return;
    setModalValorVisible(false);
  }

  function fecharModalForma() {
    if (loading) return;
    setModalFormaVisible(false);
  }

  return (
    <>
      {/* BOTÃO PRINCIPAL */}
      <TouchableOpacity
        style={s.mainTouch}
        onPress={abrirModalValor}
        disabled={loading}>
        <LinearGradient style={s.mainLinear} colors={['#99B0DC', '#2A64D0']}>
          <Text style={s.mainText}>
            {loading ? 'Processando...' : 'Pagamento total'}
          </Text>
          <Text style={s.valueText}>
            Total a receber:{' '}
            {`R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* MODAL 1 – Escolher valor a receber */}
      <Modal
        transparent
        visible={modalValorVisible}
        animationType="fade"
        onRequestClose={fecharModalValor}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.modalOverlay}>
            <View style={s.modalContainer}>
              <Text style={s.modalTitle}>Valor a receber</Text>

              <Text style={s.modalSubtitle}>
                Total da conta:{' '}
                <Text style={s.modalSubtitleBold}>
                  R{'$ '}
                  {total.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Text>

              <Text style={s.label}>Informe o valor do pagamento</Text>
              <Text style={s.helperText}>
                Você pode reduzir para receber um valor parcial.
              </Text>

              <View style={s.inputRow}>
                <Text style={s.currencyPrefix}>R$</Text>
                <TextInput
                  style={s.input}
                  value={amountText}
                  onChangeText={setAmountText}
                  keyboardType="numeric"
                  placeholder="0,00"
                  maxLength={12}
                />
              </View>

              <View style={s.footerRowBetween}>
                <TouchableOpacity
                  style={s.cancelButton}
                  onPress={fecharModalValor}
                  disabled={loading}>
                  <Text style={s.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.primaryButton}
                  onPress={confirmarValor}
                  disabled={loading}>
                  <Text style={s.primaryButtonText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL 2 – Escolher forma de pagamento */}
      <Modal
        transparent
        visible={modalFormaVisible}
        animationType="fade"
        onRequestClose={fecharModalForma}>
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>Forma de pagamento</Text>

            <Text style={s.modalSubtitle}>
              Total da conta:{' '}
              <Text style={s.modalSubtitleBold}>
                R{'$ '}
                {total.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </Text>

            <Text style={s.modalSubtitle}>
              Valor a receber agora:{' '}
              <Text style={s.modalSubtitleBold}>
                R{'$ '}
                {(valorSelecionado ?? 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </Text>

            <View style={s.optionsContainer}>
              {PAYMENT_METHODS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={s.optionButton}
                  onPress={() => processarPagamento(option.key)}
                  disabled={loading}>
                  <Text style={s.optionLabel}>{option.label}</Text>
                  {option.description ? (
                    <Text style={s.optionDescription}>
                      {option.description}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.footerRowRight}>
              <TouchableOpacity
                style={s.cancelButton}
                onPress={fecharModalForma}
                disabled={loading}>
                <Text style={s.cancelText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  mainTouch: {
    width: '100%',
    marginTop: 10,
  },
  mainLinear: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  mainText: {
    color: 'white',
    fontWeight: 'bold',
  },
  valueText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
    opacity: 0.9,
  },

  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b1b1b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  modalSubtitleBold: {
    fontWeight: 'bold',
    color: '#222',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginTop: 10,
  },
  helperText: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d4e4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
  },

  optionsContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d4e4',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  optionDescription: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  footerRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerRowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    color: '#d00',
    fontWeight: '600',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2A64D0',
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default React.memo(CardReceberPagamento);
