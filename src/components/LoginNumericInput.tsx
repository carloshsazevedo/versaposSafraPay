import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../ThemeContext/colors';

interface LoginInputNumeric{
  label?: string | undefined;
  placeholder?: string | undefined;
  onChangeText?: (text: any) => void;
  value?: string | number | undefined;

}

const LoginInputNumeric = ({ label, placeholder, onChangeText, value }: LoginInputNumeric) => {


  return (
    <View style={s.MainView}>
      {label && <Text style={s.labelText}>{label}</Text>}
      <View style={s.InputView}>
        <TextInput
          placeholderTextColor={"#9b9999ff"}
          placeholder={placeholder}
          style={s.input}
          keyboardType="numeric"
          onChangeText={onChangeText}
          value={value?.toString()}
   
          
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    
    marginHorizontal: 10,
    
  },
  InputView: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.AzulEscuro,
  },
  labelText: {
    color: colors.AzulEscuro,
    fontWeight: 'bold',
  },
  input: {
    color: colors.AzulEscuro,
    fontSize: 16,
    
  }
});

export { LoginInputNumeric };
