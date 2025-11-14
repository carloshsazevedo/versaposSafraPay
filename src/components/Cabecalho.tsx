import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../ThemeContext/colors";
import CardVoltar from "./CardVoltar";

interface CabecalhoType{
    showdebug?: string;
    voltarFunction: (value: any) => void;
}

const Cabecalho = ({voltarFunction, showdebug}: CabecalhoType) =>{

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