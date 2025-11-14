import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MainNavigator from './src/Rotas/MainNavigator';
import { useUser } from './src/Context/userContext';
import { useEmpresa } from './src/Context/empresaContext';

function AppLow() {
  const { setEmpresa } = useEmpresa();
  const { setUser } = useUser();
  const [contextoCarregado, setContextoCarregado] = useState(false);

  async function restaurarContextos() {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const storedEmpresa = await AsyncStorage.getItem('@empresa');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedEmpresa) {
        setEmpresa(JSON.parse(storedEmpresa));
      }

      setContextoCarregado(true);
    } catch (error) {
      Alert.alert(
        'Erro ao restaurar contextos',
        JSON.stringify(error),
      );
      setContextoCarregado(true);
    }
  }

  useEffect(() => {
    restaurarContextos();
  }, []);

  if (!contextoCarregado) {
    // Se quiser, pode exibir uma tela de loading aqui
    return null;
  }

  return <MainNavigator />;
}

export default AppLow;
