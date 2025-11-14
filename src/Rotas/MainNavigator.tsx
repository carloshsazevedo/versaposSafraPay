// src/Rotas/MainNavigator.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { navigationRef } from './NavigatorContainerRef';
import {createStackNavigator} from '@react-navigation/stack';
import Rotas from './Rotas';
// import {Text, View} from 'react-native';
// import {TouchableOpacity} from 'react-native-gesture-handler';

// Importa suas telas
import { Login } from '../Login/login';

import PaginaInicial from '../PaginaInicial/PaginaInicial';
import MapaMesas from '../Mesas/MapaMesas';
import Mesa from '../Mesas/Mesa';
import GruposMestre from '../Mesas/GrupoMestre';
import GruposProduto from '../Mesas/GrupoProduto';
import ProdutosInserirMesa from '../Mesas/ProdutosInserirMesa';

// function Login({navigation}: any) {
//   return (
//     <View>
//       <Text>Tela de login!</Text>
//       <TouchableOpacity
//         style={{
//           padding: 5,
//           borderWidth: 1,
//           borderColor: 'black',
//           maxWidth: '50%',
//           borderRadius: 10,
//           alignSelf: 'center',
//         }}
//         onPress={() => {
//           navigation.navigate(Rotas.PaginaInicial);
//         }}>
//         <Text>Navegar para página inicial!</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// function PaginaInicial() {
//   return (
//     <View>
//       <Text>Página inicial!</Text>
//     </View>
//   );
// }

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={Rotas.Login}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name={Rotas.Login} component={Login} />
        <Stack.Screen name={Rotas.PaginaInicial} component={PaginaInicial} />
        <Stack.Screen name={Rotas.MapaMesas} component={MapaMesas} />
        <Stack.Screen name={Rotas.Mesa} component={Mesa} />
        <Stack.Screen name={Rotas.GrupoMestre} component={GruposMestre} />
        <Stack.Screen name={Rotas.GrupoProduto} component={GruposProduto} />
        <Stack.Screen name={Rotas.ProdutosInserirMesa} component={ProdutosInserirMesa} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
