import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';

import MainNavigator from './src/Rotas/MainNavigator';
import { DebugProvider } from './src/Context/debugContext';
import { EmpresaProvider } from './src/Context/empresaContext';
import { UserProvider } from './src/Context/userContext';
import { CarrinhoProvider } from './src/Context/carrinhoContext';
import AppLow from './AppLow';

function App(): JSX.Element {


  const backgroundStyle = {
    flex: 1,
  
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      
      <DebugProvider>
          <EmpresaProvider>
            <UserProvider>
              <CarrinhoProvider>
                <View style={s.container}>
                  <AppLow />
                </View>
              </CarrinhoProvider>
            </UserProvider>
          </EmpresaProvider>
        </DebugProvider>
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  container: {
    flex: 1,
  },
});


export default App;
