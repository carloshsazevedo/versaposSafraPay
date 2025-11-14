import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import colors from '../ThemeContext/colors';

interface LoginInputTextProps {
  label?: string | undefined;
  hideview?: boolean;
  placeholder?: string | undefined;
  onChangeText: (text: any) => void;
  value: number | string | undefined;
  style?: any
}

const LoginInputText = ({
  label,
  hideview = false,
  placeholder,
  onChangeText,
  value,
  style
}: LoginInputTextProps) => {
  const showeye = require('../assets/Images/eye-closed.png');
  const hideeye = require('../assets/Images/eye-open.png');

  const [show, setshow] = useState(hideview);
  setshow;

  return (
    <View style={[s.MainView, style && style]}>
      <Text style={s.labelText}>{label}</Text>
      <View style={s.InputView}>
        <TextInput
          placeholder={placeholder}
          style={s.input}
          autoCapitalize="none"
          secureTextEntry={show}
          onChangeText={onChangeText}
          value={value?.toString()}
        />
        {hideview && (
          <TouchableOpacity
            style={s.touch}
            onPress={() => setshow((prev: any) => !prev)}
          >
            <Image
              resizeMode="contain"
              source={show ? hideeye : showeye}
              style={s.eye}
            />
          </TouchableOpacity>
        )}
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
    flexDirection: 'row',
  },
  labelText: {
    color: colors.AzulEscuro,
    fontWeight: 'bold',
  },
  input: {
    color: colors.AzulEscuro,
    flex: 1,
    fontSize: 16,
  },
  eye: {
    width: 25,
    height: 25,
    opacity: 0.5,
    marginRight: 3,
  },
  touch: {
    alignSelf: 'center',
  },
});

export { LoginInputText };
