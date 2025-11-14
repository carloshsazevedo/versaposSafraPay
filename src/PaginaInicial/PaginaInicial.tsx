import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ButtonCustom } from '../components/Button';
import colors from '../ThemeContext/colors';
import Rotas from '../Rotas/Rotas';
import { useDebug } from '../Context/debugContext';
// import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';
import { reset } from '../Rotas/NavigatorContainerRef';
import { persistirContextos } from '../Context/persistirContextos';

const PaginaInicial = ({ navigation }: any) => {
  const { debug } = useDebug();

  const { user } = useUser();

  const { empresa } = useEmpresa();

  useEffect(() => {
    persistirContextos(user, empresa)
  }, [user, empresa]);

  return (
    <View style={s.MainView}>
      {debug && (
        <>
          {/* <Text>{
        JSON.stringify(empresa)}</Text> */}
          <Text style={s.pgsTxt}>
            pgs: {String(navigation.getState().routes.length)}
          </Text>
        </>
      )}
      {debug && (
        <View
          style={{
            maxHeight: '20%',
            width: '100%',
            flexDirection: 'row',
            marginVertical: 10,
          }}
        >
          {/* Empresa Context */}
          <ScrollView style={{ flex: 1, marginRight: 5 }}>
            <View style={{ backgroundColor: 'white', padding: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                EmpresaContext:
              </Text>
              {Object.entries(empresa || {}).map(([key, value]) => (
                <Text key={key} style={{ marginBottom: 2 }}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          </ScrollView>

          {/* User Context */}
          <ScrollView style={{ flex: 1, marginLeft: 5 }}>
            <View style={{ backgroundColor: 'white', padding: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                UserContext:
              </Text>
              {Object.entries(user).map(([key, value]) => (
                <Text key={key} style={{ marginBottom: 2 }}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={s.mainContainer}>
        <View style={s.logoView}>
          <Image
            style={s.logoImage}
            source={require('../assets/Images/VersaPOSlogo.png')}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            reset(Rotas.MapaMesas, { origem: 'pagina inicial' });
          }}
        >
          <Image
            style={s.mesas_menu}
            source={require('../assets/Images/mesas_menu.png')}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {/* <Image
          style={s.mesas_menu}
          source={require('../assets/Images/comandas_menu.png')}
          resizeMode="contain"
        /> */}

        <ButtonCustom
          title="Sair"
          style={s.ButtonSair}
          onPress={() => {
            reset(Rotas.Login);
          }}
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    width: 300,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  mesas_menu: {
    width: 230,
    height: 230,
    alignSelf: 'center',
  },
  logoView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  ButtonSair: {
    backgroundColor: 'transparent',
    color: colors.AzulClaro,
    borderWidth: 2,
    borderColor: colors.AzulClaro,
  },
  pgsTxt: {
    color: '#ff0000ff',
  },
});

export default PaginaInicial;
