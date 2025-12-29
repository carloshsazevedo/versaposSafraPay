import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

let api;

// URL padrão
const DEFAULT_URL = "http://200.150.192.147:8085"

// Função para inicializar cliente axios
export async function initApi() {
  if (api) return api; // 🔒 garante singleton

  const savedUrl = await AsyncStorage.getItem("API_URL");

  api = axios.create({
    baseURL: savedUrl || DEFAULT_URL,
    timeout: 10000,
  });

  // 🔹 INTERCEPTORS (registrados UMA VEZ)
  api.interceptors.response.use(
    (response) => {
      console.log("tratando resposta...");

      if (response?.data?.erro) {
        if (response.data.erro !== "Parcela(s) não encontrado(s).") {
          Alert.alert("Resultado", response.data.erro);
        }
        return Promise.reject(response.data.erro);
      }

      if (Array.isArray(response.data) && response.data[0]?.erro) {
        Alert.alert("Resultado", response.data[0].erro);
        return Promise.reject(response.data[0].erro);
      }

      if (response?.data?.mensagem) {
        Alert.alert("Mensagem", String(response.data.mensagem));
      }

      return response;
    },
    (error) => {
      console.log("tratando erro...");

      if (error.code === "ECONNABORTED") {
        Alert.alert("Tempo de conexão excedido");
      } else if (error?.message === "Network Error") {
        Alert.alert("Erro de conexão", "Verifique a disponibilidade da API");
      } else if (error.response?.data?.erro) {
        Alert.alert("Erro", error.response.data.erro);
      } else {
        Alert.alert("Erro inesperado");
      }

      return Promise.reject(error);
    }
  );

  console.log("✅ API inicializada com interceptors");
  return api;
}

// 🔹 usado nas rotas
export async function getApi() {
  if (!api) {
    await initApi();
  }
  return api;
}

// 🔹 troca de URL em runtime
export async function setApiUrl(newUrl) {
  await AsyncStorage.setItem("API_URL", newUrl);

  if (api) {
    api.defaults.baseURL = newUrl || DEFAULT_URL;
  }
}

