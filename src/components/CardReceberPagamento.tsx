import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';
import { CadastroMovimentoPagamento } from '../API/api_rotas';
import { reset } from '../Rotas/NavigatorContainerRef';
import Rotas from '../Rotas/Rotas';

import {
  vendaCreditoSafra,
  SafraTransactionResult,
  vendaCreditoParcSemJurosSafra,
  vendaDebitoSafra,
  vendaPixSafra,
  vendaQRCodeSafra,
  vendaVoucherSafra,
  impressaoLivreSafra,
} from '../native/safrapay';

type Props = {
  total: number;
  idmovimento: string | number;
  nummesa: string | number;
};

const CardReceberPagamento: React.FC<Props> = ({ total, idmovimento, nummesa }) => {
  const { user } = useUser();
  const { empresa } = useEmpresa();

  async function registrarPagamentoBackend(
    orderId: string,
    result: SafraTransactionResult,
  ) {
    const [idmov, mesa] = orderId.split('-');

    // Aqui você ainda não tem o "type" (CRÉDITO / DÉBITO / PIX) igual Stone,
    // então vou assumir CRÉDITO para o exemplo.
    // Depois, se você mapear isso a partir de "result.raw" ou de outra info,
    // é só ajustar esse if.
    const idformapagtodfe = '3'; // 3 = crédito, 4 = débito, 17 = pix, etc.

    // {
    //         idusuario: user.usuario,
    //         servername: user.servername,
    //         serverport: user.serverport,
    //         pathbanco: user.pathbanco,
    //         idempresa: empresa?.idparametro,
    //         ...params,
    //         idformapagtodfe:
    //           params.type === 'CRÉDITO'
    //             ? '3'
    //             : params.type === 'DÉBITO'
    //             ? '4'
    //             : params.type === 'PIX'
    //             ? '17'
    //             : '99',
    //         order_id: idmovimento,
    //       }

    await CadastroMovimentoPagamento({
      idusuario: user.usuario,
      servername: user.servername,
      serverport: user.serverport,
      pathbanco: user.pathbanco,
      idempresa: empresa?.idparametro,

      // o back já espera esses campos do fluxo antigo:
      order_id: idmov,
      amount: String(Math.round(total * 100)), // em centavos
      gateway: 'SAFRAPAY',
      idformapagtodfe,
      // salva o log bruto da transação para auditoria
      resultado_safra: result.raw,
    });

    const dataenviar = new Date();

    reset(Rotas.Mesa as never, {
      idmovimento: idmov,
      nummesa: mesa,
      data: `${dataenviar}`,
      statusmesa: 'O',
    } as never);
  }

  async function enviarPagamento() {
    try {
      console.log('CardReceberPagamento: iniciando venda SafraPay...');

      // Mesma lógica de order_id que você usava no deeplink:
      const orderId = `${idmovimento}-${nummesa}`;
      
      console.log("total: ", total)
      // Aqui escolhemos EXPLICITAMENTE a operação.
      // Ex.: crédito à vista – se quiser débito, troque para vendaDebitoSafra(...)
      const result = await vendaCreditoSafra(total, orderId);


      console.log('SafraPay retorno:', result);

      if (!result.sucesso) {
        Alert.alert(
          'Falha no pagamento SafraPay',
          result.raw || 'Transação não aprovada',
        );
        return;
      }

      Alert.alert('Pagamento aprovado SafraPay!', '');

      await registrarPagamentoBackend(orderId, result);
    } catch (err: any) {
      console.error('Erro ao processar pagamento SafraPay:', err);
      Alert.alert(
        'Erro ao processar pagamento SafraPay',
        err?.message || String(err),
      );
    }
  }

  return (
    <TouchableOpacity style={s.mainTouch} onPress={enviarPagamento}>
      <LinearGradient style={s.mainLinear} colors={['#99B0DC', '#2A64D0']}>
        <Text style={s.mainText}>Receber pagamento (SafraPay)</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  mainTouch: {
    width: '100%',
    marginTop: 10,
  },
  mainLinear: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  mainText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CardReceberPagamento;
