import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  imprimirCupomSafra,
  SafraPrintLine,
} from '../native/safrapay';

const CardImprimirConta = ({ info }: any) => {
  function formatarValor(valor: number) {
    return valor?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    });
  }

  async function imprimirConta() {
    try {
      const agora = new Date();
      const dataStr = agora.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });

      const linhas: SafraPrintLine[] = [];

      const pushText = (
        content: string,
        align: 'left' | 'center' | 'right' = 'left',
        size: 'small' | 'medium' | 'large' | 'extra_large' = 'medium',
        style: 'normal' | 'bold' | 'italic' | 'invert' = 'bold'
      ) => {
        linhas.push({
          type: 'text',
          content,
          align,
          size,
          style: style
        });
      };

      // Cabeçalho
      pushText('------------------------------------------', 'center', 'small', 'normal');
      pushText('CONTA PARCIAL DA MESA - PDV', 'center', 'extra_large');
      pushText(' ', 'center', 'large');
      pushText(`Mesa: ${info.mesa}`, 'left', 'extra_large');
      pushText(`Impresso por: ${info.idusuario}`, 'left', 'large');
      pushText(`Impressão: ${dataStr}`, 'left', 'large');
      pushText(`Abertura: ${info.abertura}`, 'left', 'large');
      pushText(`Permanência: ${info.utilizacao}`, 'left', 'large');
      pushText(`Garçom: ${info.garcom}`, 'left', 'large');
      pushText('------------------------------------------', 'center', 'small', 'normal');
      pushText('Produtos', 'center', 'extra_large');
      

      // Itens
      for (const item of info.itens) {
        const nome = (item.nomeproduto ?? '').toUpperCase();
        const qtd = (item.quantidade ?? 0)
          .toFixed(3)
          .replace('.000', '');
        const precoUnit = formatarValor(item.precooriginal ?? 0);
        const totalItem = formatarValor(item.totalitem ?? 0);

        // Linha principal (limita nome pra não estourar)
        // const nomeCorte = nome.substring(0, 15);
        const linhaPrincipal = `${nome}`;
        const quantidadePreco = `${qtd} x ${precoUnit} = R$ ${totalItem}`
        pushText('------------------------------------------', 'center', 'small', 'normal');
        pushText(linhaPrincipal, 'left', 'large', 'bold');
        pushText(quantidadePreco, 'left', 'large', 'bold');
        

        // Se quiser quebrar nome muito longo em 2 linhas, pode ativar isso:
        // if (nome.length > 20) {
        //   const restante = nome.substring(20);
        //   pushText(restante, 'left', 'small');
        // }
      }

      // Totais
      const subtotal = Number(
        info.itens.reduce(
          (acc: number, item: any) => acc + (item.totalitem || 0),
          0,
        ),
      ).toFixed(2);

      pushText('--------------------------------------', 'center');
      pushText(`(=) Subtotal: R$ ${subtotal}`, 'left', 'large');
      pushText(
        `(+) Taxa garçom: R$ ${formatarValor(info.taxa)}`,
        'left', 'large'
      );
      pushText('--------------------------------------', 'center');
      pushText(
        `Total: R$ ${formatarValor(info.total)}`,
        'left', 'extra_large'
      );

      // Se quiser uma linha em branco antes de cortar:
      linhas.push({ type: 'blank' });

      console.log('Enviando linhas para SafraPay:', JSON.stringify(linhas));

      await imprimirCupomSafra(linhas);

    } catch (err: any) {
      console.log('Erro ao enviar impressão SafraPay:', err);
      Alert.alert(
        'Erro ao enviar impressão SafraPay',
        err?.message || String(err),
      );
    }
  }

  return (
    <LinearGradient colors={['#2A64D0', '#99B0DC']} style={s.cardRight}>
      <TouchableOpacity onPress={imprimirConta}>
        <Image
          style={s.imageRight}
          source={require('../assets/Images/icon_imprimir.png')}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  cardRight: {
    width: '33.1%',
    justifyContent: 'center',
    padding: 10,
  },
  imageRight: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },
});

export default CardImprimirConta;
