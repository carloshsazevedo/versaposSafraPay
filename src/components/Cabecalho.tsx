import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../ThemeContext/colors";
import CardVoltar from "./CardVoltar";

interface CabecalhoType{
    showdebug?: string;
    voltarFunction: (value: any) => void;
    nummesa?: string;
}

const Cabecalho = ({voltarFunction,nummesa, showdebug}: CabecalhoType) =>{

    return(
        <View style={s.Header}>
         
        <TouchableOpacity
          onPress={voltarFunction}
          style={s.cardVoltar}
        >
          <CardVoltar />
        </TouchableOpacity>
        <View>
        <Image
          style={s.logoImage}
          source={require('../assets/Images/VersaPOSlogo.png')}
          resizeMode="contain"
        />
        {showdebug && <Text style={s.showdebug}>{showdebug}</Text>}
        </View>

        {nummesa && (
        <Text
          style={{
            position: 'absolute',
            backgroundColor: '#2A64D0',
            borderRadius: 10,
            padding: 4,
            fontWeight: 'bold',
            color: 'white',
            right: 0,
            alignSelf: 'center',
          }}>
          {nummesa}
        </Text>
      )}
      </View>
    )
}

const s = StyleSheet.create({
  Header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomColor: colors.CinzaClaro,
    borderBottomWidth: 1,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  cardVoltar: {
    position: 'absolute',
    left: 0,
    alignSelf: 'center',
  },
  showdebug: {
    color: "red"
  }
});


export default Cabecalho;