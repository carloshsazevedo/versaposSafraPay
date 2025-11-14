

import { View,Image,Text, StyleSheet } from "react-native"



export default function CardParceiro(){
    


    return (
        <View>
                


            <View  style={{ borderRadius:6,   width:160,   borderColor:"#7392CD",   height:55,   borderWidth:2,   justifyContent:"center",   alignItems:"center",    flexDirection:"row",    paddingHorizontal:3,  }}
             >


<Image
                style={{ width: 35, height: 20, flexDirection: "column" }}
                
                alt={"icon_parceiro"}
                source={require("../assets/Images/icon_parceiro.png")}
                 />


            <Text style={s.TextParceiro} >Parceiro</Text>
            </View>
       
        </View>
    )
}


const s = StyleSheet.create({
    TextParceiro:{
        marginLeft: 5,
        alignSelf: "center",
        color: "#7392CD",
        fontWeight: "bold",
        fontSize: 15
    }
})