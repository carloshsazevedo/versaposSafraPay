import LinearGradient from "react-native-linear-gradient"
import colors from "../ThemeContext/colors"
import { Image, StyleSheet } from "react-native"
// import { faAngleLeft } from "@fortawesome/free-solid-svg-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
// @ts-ignore
import Icon from 'react-native-vector-icons/Feather';

const CardVoltar = () => {


    return (

        <LinearGradient
                    // Backgro3und Linear Gradient
                    colors={[colors.AzulClaro, "#7392CD"]
                    }
                    style={s.arrowleft}
                  >
                    
                  
        {/* <FontAwesomeIcon icon={faAngleLeft as any}  color='white'/> */}
        <Image source={require("../assets/Images/arrow_left_white.png")}
        style={{width: 8, height: 15}}/>
          </LinearGradient>
        
    )
}


const s = StyleSheet.create({
    arrowleft: {
    backgroundColor: colors.AzulClaro,
    margin:10,
    padding: 4,
    paddingHorizontal: 15,
    borderRadius: 7,
    
    
    alignSelf: "center"
  }
})


export default CardVoltar;