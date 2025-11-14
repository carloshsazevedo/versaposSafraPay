import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoginInputNumeric } from '../components/LoginNumericInput';
import { LoginInputText } from '../components/LoginTextInput';
import { ButtonCustom } from '../components/Button';
import Rotas from '../Rotas/Rotas';
import { useEffect, useState } from 'react';
import SwitchCustom from '../components/Switch';
import { useUser } from '../Context/userContext';
import { useDebug } from '../Context/debugContext';
import {
  ConsultaParametros,
  loginEfetuarLogin,
  loginValidarAcesso,
} from '../API/api_rotas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEmpresa } from '../Context/empresaContext';
import { ScrollView } from 'react-native-gesture-handler';
import { reset } from '../Rotas/NavigatorContainerRef';
import valores from '../constants/constants';
import { setApiUrl } from '../API/api';

const Login = ({}: any) => {
  const { user, setUser } = useUser();
  const [usuario, setusuario] = useState('');
  const [senha, setSenha] = useState('');
  const [CNPJ, setCNPJ] = useState('');
  const [configContador, setConfigContador] = useState(0);
  const { debug, setDebug } = useDebug();
  const [gravarCredenciais, setgravarCredenciais] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [modalParametrosVisivel, setModalParametrosVisivel] = useState(false);
  const [parametros, setParametros] = useState([] as any[]);
  const [idparametroselecionado, setidparametroselecionado] = useState('');
  const { empresa, setEmpresa } = useEmpresa();
  const [apiURL, setapiurlchange] = useState('');

  useEffect(() => {
    async function getParams() {
      const defaultgravarcredenciais = await AsyncStorage.getItem(
        'defaultgravarcredenciais',
      );
      const savedUrl = await AsyncStorage.getItem('API_URL');
      const CNPJsalvo = await AsyncStorage.getItem('CNPJ');
      const usuariosalvo = await AsyncStorage.getItem('usuario');
      const senhasalvo = await AsyncStorage.getItem('senha');

      setCNPJ(CNPJsalvo || '');
      setusuario(usuariosalvo || '');
      setSenha(senhasalvo || '');
      setapiurlchange(savedUrl ?? '');
      setgravarCredenciais(defaultgravarcredenciais ? true : false);
    }

    getParams();
  }, []);

  async function validarAcesso() {
    try {
      setisloading(true);
      const responseValidarCNPJ = await loginValidarAcesso({
        cnpj: CNPJ,
        ambiente: 'producao',
      });

      console.log(
        'resposta validarCNPJ: ',
        JSON.stringify(responseValidarCNPJ.data[0]),
      );

      const servername = responseValidarCNPJ.data[0].servername;
      const serverport = responseValidarCNPJ.data[0].serverport;
      const pathbanco = responseValidarCNPJ.data[0].pathbanco;

      const responseEfetuarLogin = await loginEfetuarLogin({
        servername,
        pathbanco,
        serverport,
        idusuario: usuario,
        senha: senha,
        versao: valores.versao,
        versapos: true,
      });

      console.log(
        'resposta efetuarLogin: ',
        JSON.stringify(responseEfetuarLogin.data),
      );

      const idfuncionario = responseEfetuarLogin.data.idfuncionario;

      if (gravarCredenciais) {
        AsyncStorage.setItem('CNPJ', CNPJ ? CNPJ : '');
        AsyncStorage.setItem('usuario', usuario ? usuario : '');
        AsyncStorage.setItem('senha', senha ? senha : '');
        AsyncStorage.setItem('defaultgravarcredenciais', 'S');
      } else {
        AsyncStorage.removeItem('defaultgravarcredenciais');
        AsyncStorage.removeItem('CNPJ');
        AsyncStorage.removeItem('usuario');
        AsyncStorage.removeItem('senha');
      }

      setUser({
        ...user,
        usuario: usuario,
        servername,
        pathbanco,
        serverport,
        idfuncionario,
      });

      const responseConsultaParametros = await ConsultaParametros({
        servername,
        serverport,
        pathbanco,
        usuario,
      });

      if (responseConsultaParametros.data.length > 1) {
        setParametros(responseConsultaParametros.data);
        setidparametroselecionado('');
        setModalParametrosVisivel(true);
        setEmpresa(undefined);
        setisloading(false);
        return;
      }
      setEmpresa(responseConsultaParametros.data[0]);
      reset(Rotas.PaginaInicial, { 'origem:': 'login' });
      setisloading(false);
    } catch (error) {
    } finally {
      setisloading(false);
    }
  }

  const renderParametro = ({ item, index }: any) => {
    return (
      <View
        key={item.cnpj}
        style={[
          s.empresaItem,
          idparametroselecionado === JSON.stringify(item.idparametro)
            ? s.selectedItem
            : index % 2 === 0
            ? s.evenItem
            : s.oddItem,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            setidparametroselecionado(`${item.idparametro}`);
            setEmpresa(item);
          }}
        >
          <View style={s.empresaContent}>
            <View style={s.empresaInfo}>
              <Text style={s.Tx2}>
                {item.apelido ? item.apelido : item.nomeempresa}
              </Text>
              <Text style={s.Tx3}>{item.endbairro}</Text>
            </View>
            <Image
              accessibilityLabel="icone_empresa"
              style={s.img2}
              source={require('../assets/Images/iconeEmpresa.png')}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.mainView}>
      <ImageBackground
        source={require('../assets/Images/wallpaper3.png')}
        style={s.backgroundImage}
        resizeMode="cover"
      >
        <Text style={s.txtversao}>{valores.versao}</Text>
        {debug && (
          <View style={s.debugview}>
            {/* Empresa Context */}
            <ScrollView style={s.empresacontextscroll}>
              <View style={s.empresacontextview}>
                <Text style={s.empresacontexttext}>EmpresaContext:</Text>
                {Object.entries(empresa || {}).map(([key, value]) => (
                  <Text key={key} style={s.empresacontextitemmaptext}>
                    {key}: {String(value)}
                  </Text>
                ))}
              </View>
            </ScrollView>

            {/* User Context */}
            <ScrollView style={s.empresacontextscroll}>
              <View style={s.empresacontextview}>
                <Text style={s.empresacontexttext}>UserContext:</Text>
                {Object.entries(user).map(([key, value]) => (
                  <Text key={key} style={s.empresacontextitemmaptext}>
                    {key}: {String(value)}
                  </Text>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        <Modal
          visible={modalParametrosVisivel}
          transparent
          animationType="fade"
          onRequestClose={() => setModalParametrosVisivel(false)}
          style={s.modalParametros}
        >
          <View style={s.modalBackground}>
            <View style={s.modalContent}>
              <Text style={[s.Tx1, s.headerText]}>Selecione a empresa</Text>
              <FlatList
                data={parametros}
                renderItem={renderParametro}
                keyExtractor={item => item.cnpj}
                showsVerticalScrollIndicator={false}
                style={s.flatlistParametro}
              />

              <View style={s.viewBotoesModalParametros}>
                <TouchableOpacity
                  onPress={() => {
                    setParametros([]);
                    setModalParametrosVisivel(false);
                    setEmpresa(undefined);
                  }}
                >
                  <Text style={s.txtCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <ButtonCustom
                  title="Continuar"
                  onPress={() => {
                    if (empresa?.cnpj) {
                      reset(Rotas.PaginaInicial);
                      setModalParametrosVisivel(false);
                    } else {
                      Alert.alert('Selecione uma empresa.');
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
        <View style={s.mainContainer}>
          <View style={s.logoView}>
            <TouchableOpacity
              onLongPress={() => {
                setConfigContador(0);
              }}
              onPress={() => {
                setConfigContador(configContador + 1);
              }}
            >
              <Image
                style={s.logoImage}
                source={require('../assets/Images/VersaPOSlogo.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {configContador > 5 && (
            <View>
              {usuario === 'master' && (
                <SwitchCustom
                  label={'Debug'}
                  style={s.switch}
                  value={debug}
                  onChange={() => {
                    setDebug(!debug);
                  }}
                />
              )}
              <LoginInputText
                value={apiURL}
                onChangeText={setapiurlchange}
                label={'API'}
                placeholder={'Endereço da API'}
              />
              <View style={{ flexDirection: 'row' }}>
                <ButtonCustom
                  title="Salvar"
                  onPress={() => {
                    setApiUrl(apiURL);
                  }}
                  style={{ marginTop: 5 }}
                />
                <ButtonCustom
                  title="Limpar"
                  onPress={() => {
                    setapiurlchange('');
                    setApiUrl('');
                  }}
                  style={{ backgroundColor: 'red', marginTop: 5 }}
                />
              </View>
            </View>
          )}

          <LoginInputNumeric
            label={'CNPJ'}
            value={CNPJ}
            onChangeText={setCNPJ}
          />

          <LoginInputText
            label={'Usuário'}
            value={usuario}
            onChangeText={setusuario}
            style={s.inputs}
          />

          <LoginInputText
            label={'Senha'}
            hideview
            value={senha}
            onChangeText={setSenha}
            style={s.inputs}
          />
          <SwitchCustom
            style={s.gravarSwitch}
            value={gravarCredenciais}
            onChange={setgravarCredenciais}
            label={'Gravar credenciais de acesso'}
          />
          {isloading && <ActivityIndicator size={'small'} />}
          <ButtonCustom
            title="Acessar"
            onPress={() => {
              setisloading(true);
              if (!usuario || !CNPJ || !senha) {
                Alert.alert('Preencha todos os campos!');
                setisloading(false);
                return;
              }

              validarAcesso();
            }}
            style={s.buttonAcessar}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const s = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  buttonAcessar: {
    marginTop: 30,
  },
  inputs: { marginTop: 15 },
  switchView: {
    flexDirection: 'row',
  },
  switch: {},
  gravarSwitch: { alignSelf: 'center', marginTop: 15 },
  modalParametros: {
    backgroundColor: 'transparent',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    elevation: 5,
    minWidth: '80%',
  },
  empresaItem: {
    width: '95%',
    alignSelf: 'center',
    padding: 12,
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
  },
  evenItem: {
    backgroundColor: '#F5F5F5',
  },
  oddItem: {
    backgroundColor: 'white',
  },
  empresaContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empresaInfo: {
    justifyContent: 'flex-start',
  },
  Tx2: {
    color: '#3562bc',
    fontSize: 18,
    textAlign: 'left',
  },
  Tx3: {
    color: '#3562bc',
    opacity: 0.7,
    fontSize: 10,
    textAlign: 'left',
  },
  img2: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  flatlistParametro: { flexGrow: 0 },
  viewBotoesModalParametros: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  txtCancelar: {
    color: '#888888ff',
  },
  Tx1: {
    color: '#3562bc',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerText: {
    alignSelf: 'center',
    marginVertical: 3,
  },
  txtversao: { position: 'absolute', bottom: 0, color: 'white' },
  empresacontextview: { backgroundColor: 'white', padding: 10 },
  empresacontexttext: { fontWeight: 'bold', marginBottom: 5 },
  empresacontextscroll: { flex: 1, marginLeft: 5 },
  empresacontextitemmaptext: { marginBottom: 2 },
  debugview: {
    maxHeight: '20%',
    width: '100%',
    flexDirection: 'row',
    marginVertical: 10,
  },
});

export { Login };
