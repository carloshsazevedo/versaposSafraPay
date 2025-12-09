import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CardItemMovimento from './CardItemMovimento';
import React from 'react';


interface CardItensMovimentoProps{
    itensmovimento: any[];
    onPressLupa?: () => void;
    onPressAddItem?: () => void;
    onPressExcluir?: (iditemmovimento: any) => void;
}

const CardItensMovimento = ({ itensmovimento, onPressLupa, onPressAddItem, onPressExcluir}: CardItensMovimentoProps ) => {


  return (
    <View style={s.MainView}>
      <LinearGradient colors={['#2A64D0', '#99B0DC']} style={s.LinarGradient} />
      <View style={s.ViewBodyCard}>
        <Image
          alt={'icon_listaitensmovimento'}
          style={s.imageListaItens}
          source={require('../assets/Images/icon_listaitensmovimento.png')}
        />
        <View style={s.ViewTotalPesquisaInserir}>
          <View style={s.ViewTotalItens}>
            <Text style={s.TotalItens}>
              R${' '}
              {String(
                Number(
                  itensmovimento.reduce(
                    (acc: any, item: any) => acc + (item.totalitem || 0),
                    0,
                  ),
                ).toFixed(2),
              ).replace('.', ',')}{' '}
            </Text>
          </View>

              {onPressLupa &&
          <TouchableOpacity onPress={onPressLupa}>
            <Image
              alt={'pesquisar_movimentos'}
              source={require('../assets/Images/pesquisar_movimentos.png')}
              style={s.imagePesquisaMovimentos}
            />
          </TouchableOpacity>}

          <TouchableOpacity onPress={onPressAddItem}>
          <Image
            alt={'icon_adicionar'}
            source={require('../assets/Images/icon_adicionar.png')}
            style={s.imageAdicionarItens}
          />
          </TouchableOpacity>
        </View>
        {itensmovimento.map((item: any, index: any) => (
            <View key={index} style={s.ViewItemMovimento}>
          <CardItemMovimento itemmovimento={item} onPressExcluir={onPressExcluir}/>
          </View>
        ))}

        <View style={{height: 300}}></View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {},
  LinarGradient: {
    height: 55,
    marginTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  ViewBodyCard: {
    borderRightColor: 'grey',
    borderLeftColor: 'grey',
    borderRightWidth: 1,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  imageListaItens: {
    alignSelf: 'center',
    width: 50,
    height: 50,
    marginTop: -25,
  },
  ViewTotalPesquisaInserir: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  ViewTotalItens: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c0c0c0ff',
    marginVertical: 10,
    justifyContent: 'center',
  },
  TotalItens: {
    color: '#c0c0c0ff',
    fontWeight: 'bold',
  },
  imagePesquisaMovimentos: { width: 40, height: 40 },
  imageAdicionarItens: { width: 40, height: 40 },
  ViewItemMovimento: {
    marginVertical: 5
  }
});

export default React.memo(CardItensMovimento);
