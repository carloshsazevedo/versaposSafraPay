import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface InputProps {
  mesa: any;
}

export default function CardMesa({ mesa }: InputProps) {
  
  const cor_ocupada: string[] = ['#FE546A', '#EE8795'];
  const cor_reservada: string[] = ['#FFA54D', '#FDCD9E'];
  const cor_livre: string[] = ['#21C55C', '#51FF8F'];

  return (
    <View style={s.mainview}>
      {mesa.mesafechada === 'S' && (
        <View style={s.fechamento}>
          <Text style={s.textfechamento}>fechamento</Text>
        </View>
      )}

      <View style={s.container}>
        <View style={s.imageview}>
          {mesa.statusmesa === 'O' ? (
            <>
              <Image
                style={s.image}
                alt={'card_mesa'}
                source={require('../assets/Images/mesa_ocupada.png')}
              />
            </>
          ) : (
            <></>
          )}

          {mesa.statusmesa === 'R' ? (
            <>
              <Image
                style={s.image}
                alt={'card_mesa'}
                source={require('../assets/Images/mesa_reservada.png')}
              />
            </>
          ) : (
            <></>
          )}

          {mesa.statusmesa === 'L' ? (
            <>
              <Image
                style={s.image}
                alt={'card_mesa'}
                source={require('../assets/Images/mesa_livre.png')}
              />
            </>
          ) : (
            <></>
          )}
        </View>

        {mesa.funcionario && (
          <View style={s.viewfuncionario}>
            <Text style={s.textfuncionario}>{mesa.funcionario}</Text>
          </View>
        )}
      </View>
      <View>
        <LinearGradient
          // Backgro3und Linear Gradient
          colors={
            mesa.statusmesa === 'O'
              ? cor_ocupada
              : mesa.statusmesa === 'R'
              ? cor_reservada
              : cor_livre
          }
          style={s.lineargradient}
        >
          <Text style={s.textnummesa}>{mesa.nummesa}</Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fechamento: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#e99629ff',
    zIndex: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  textfechamento: {
    width: '100%',
    textAlign: 'center',
    color: 'white',
  },
  mainview: {
    width: 130,
    height: 130,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomWidth: 0,
    width: 130,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderTopColor: '#eeededff',
    borderRightColor: '#eeededff',
    borderLeftColor: '#eeededff',
    borderBottomColor: 'red.300',
    height: 100,
  },
  imageview: {
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  image: { width: 80, height: 80, flexDirection: 'column' },
  viewfuncionario: {
    bottom: 0,
    position: 'absolute',
    justifyContent: 'center',
    width: '100%',
  },
  textfuncionario: { color: '#e2dbdbff', alignSelf: 'center' },
  lineargradient: {
    left: 0,
    right: 0,
    top: 0,
    height: 30,
    width: 130,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#FE546A',
  },
  textnummesa: { alignSelf: 'center', color: 'white', fontSize: 18 },
});
