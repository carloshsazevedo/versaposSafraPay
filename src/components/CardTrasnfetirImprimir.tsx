import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CardImprimirConta from './CardImprimirConta';

interface CardTransfimpProps {
  idmovimento?: string;
  onPressTransferir?: () => void;
  info: any
}

const CardTrasnfetirImprimir = ({
  idmovimento,
  onPressTransferir,
  info
}: CardTransfimpProps) => {
  return (
    <View style={s.MainView}>
      <LinearGradient colors={['#2A64D0', '#99B0DC']} style={s.cardLeft}>
        <TouchableOpacity onPress={onPressTransferir}>
          <Image
            style={s.imageLeft}
            source={require('../assets/Images/icon_transferirmesa.png')}
          />
        </TouchableOpacity>
      </LinearGradient>

      <LinearGradient colors={['#2A64D0', '#99B0DC']} style={s.cardMiddle}>
        <Text style={s.textMiddle}>N° venda: {idmovimento}</Text>
      </LinearGradient>

      <CardImprimirConta
        info={info}
      />
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    maxHeight: 70,
  },
  cardLeft: {
    width: '33.1%',
    justifyContent: 'center',
    padding: 10,
  },
  imageLeft: {
    width: 70,
    height: 30,
    alignSelf: 'center',
  },
  cardMiddle: {
    marginHorizontal: 1,
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  textMiddle: {
    color: 'white',
    fontSize: 12,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CardTrasnfetirImprimir;
