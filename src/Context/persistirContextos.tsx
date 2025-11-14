import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Salva os contextos `user` e `empresa` no AsyncStorage.
 * Sempre sobrescreve qualquer valor anterior.
 */
export async function persistirContextos(user: any, empresa: any) {
  try {
    await AsyncStorage.setItem('@user', JSON.stringify(user || {}));
    await AsyncStorage.setItem('@empresa', JSON.stringify(empresa || {}));
    console.log('persistirContextos: contextos salvos com sucesso.');
  } catch (error) {
    console.error('persistirContextos: erro ao salvar contextos:', error);
  }
}
