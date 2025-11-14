import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../ThemeContext/colors';


interface ButtonProps {
    title?: string;
    onPress?: () => void;
    style?: any;
}

const ButtonCustom = ({title, onPress = () => {}, style}: ButtonProps) => {

  

  return (
    <View>
      <TouchableOpacity onPress={() => onPress()} style={[s.buttonMain, style]}>
        <Text style={[s.buttonText, style?.color && {color: style.color}]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  buttonMain: {
    marginHorizontal: 10,
    backgroundColor: colors.AzulClaro,
    padding: 8,
    borderRadius: 10
    
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16
  },
  
})

export { ButtonCustom };
