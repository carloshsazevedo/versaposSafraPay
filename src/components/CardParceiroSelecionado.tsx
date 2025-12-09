import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';

interface FornecedorType {
  nome: string;
  tipofornecedor: string;
  cnpj: string;
}

interface FornecedorCard {
  fornecedor: FornecedorType;
}
function CardParceiroSelecionado({fornecedor}: FornecedorCard) {
  return (
    <View>
      <View style={s.MainView}>
        <Image
          style={s.image}
          alt={'icon_parceiro_branco'}
          source={require('../assets/Images/icon_parceiro_branco.png')}
        />

        <View style={s.View2}>
          <Text numberOfLines={2} style={s.FornNome}>
            {fornecedor.nome}
          </Text>
          <Text style={s.FornTipo}>
            {fornecedor.tipofornecedor === 'J' ? 'CNPJ:' : 'CPF:'}{' '}
            {fornecedor.cnpj}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  FornNome: {
    marginRight: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    maxWidth: '70%',
    textAlign: 'center',
  },
  FornTipo: {marginRight: 1, color: 'white', fontWeight: 'bold', fontSize: 9},
  View2: {marginLeft: 1},
  MainView: {
    borderRadius: 6,
    width: 160,
    backgroundColor: '#7392CD',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 3,
  },
  image: {width: 35, height: 20, flexDirection: 'column', marginRight: 5},
});
export default React.memo(CardParceiroSelecionado);
