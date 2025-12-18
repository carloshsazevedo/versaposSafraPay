import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

let api;

// URL padrão
const DEFAULT_URL = "http://200.150.192.147:8085"

// Função para inicializar cliente axios
export async function getApi() {
  if (!api) {
    //### pega a URL salva ou usa a default
    const savedUrl = await AsyncStorage.getItem("API_URL");
    api = axios.create({
      baseURL: savedUrl || DEFAULT_URL,
      timeout: 10000,
    });

    //### interceptors (tratamento global de erros)
    api.interceptors.response.use(
      (response) => {
    //### 🔹 Tratar erro mesmo com status 200
        console.log('tratando resposta...')
    if (response?.data?.erro) {
      if (response.data.erro !== 'Parcela(s) não encontrado(s).'){
      Alert.alert("Resultado:", response.data.erro);}
      return Promise.reject({ message: response.data.erro });
    }

    //### Caso a API mande erro em um array
    if (Array.isArray(response.data) && response.data[0]?.erro) {
      Alert.alert("", response.data[0].erro);
      return Promise.reject({ message: response.data[0].erro });
    }
if (response?.data?.mensagem){
  Alert.alert("mensagem: ", String(response?.data?.mensagem))
}
    

    return response;},
      (error) => {

   console.log('tratando erro...')
        
        if (error.code === "ECONNABORTED") {
          Alert.alert("Tempo de conexão excedido");
          return Promise.reject({ message: "Tempo de conexão excedido" });
        }
        if (error.response) {
          if (error.response.data?.erro){
            Alert.alert("Resultado:", error.response.data?.erro)
          }
          else if (error.response.data[0]?.erro){
            Alert.alert("Resultado:", error.response.data[0]?.erro)
          }
          else{
          Alert.alert("Erro de conexão com o servidor:", JSON.stringify(error.response))
          }
          // console.log("Erro de conexão com o servidor: ", error.response)
          return Promise.reject(error.response.data);
        }
        if (error?.message === "Network Error"){
          Alert.alert("Erro de conexão com o servidor", "Verifique a disponibilidade de API")
          return Promise.reject({ message: "Erro de conexão com o servidor" });
        }

        Alert.alert("Erro de conexão com o servidor:", JSON.stringify(error))
        
        
        return Promise.reject({ message: "Erro de conexão com o servidor" });
      }
    );
  }
  return api;
}

// Função para atualizar URL da API
export async function setApiUrl(newUrl) {

  await AsyncStorage.setItem("API_URL", newUrl);
  api = axios.create({
    baseURL: newUrl || DEFAULT_URL,
    timeout: 5000,
  });
}


