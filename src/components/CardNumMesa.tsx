import {  Image, StyleSheet, Text, View } from 'react-native';




interface InputProps {

    mesa: any

}

export default function CardNumMesa({ mesa }: InputProps) {

    const cor_ocupada = ['#EE8795', '#D13E52']
    const cor_reservada = ['#FDCD9E', '#FFA54D']
    const cor_livre = ['#21C55C', '#51FF8F']

    
    return (
        <View style={{
                backgroundColor: mesa.statusmesa == 'O' ? cor_ocupada[0] : mesa.statusmesa == 'R' ? cor_reservada[0] : cor_livre[0],
                borderRadius: 6,
                width: 160,
                borderColor: mesa.statusmesa == 'O' ? cor_ocupada[1] : mesa.statusmesa == 'R' ? cor_reservada[1] : cor_livre[1],
                height: 55,
                borderWidth: 2,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 3
            }}
            >

            
                {mesa.statusmesa == 'O' ? <><Image
                    style={{ width: 40, height: 40, flexDirection: "column" }}

                    alt={"card_mesa"}
                    source={require("../assets/Images/mesa_ocupada.png")} /></> : <></>}


                {mesa.statusmesa == 'R' ? <><Image
                    style={{ width: 40, height: 40, flexDirection: 'column' }}

                    alt={"card_mesa"}
                    source={require("../assets/Images/mesa_reservada.png")} /></> : <></>}


                {mesa.statusmesa == 'L' ? <><Image
                    style={{ width: 40, height: 40, flexDirection: 'column' }}

                    alt={"card_mesa"}
                    source={require("../assets/Images/mesa_livre.png")} /></> : <></>}

                <View style={{ marginLeft: 4, marginRight: 5, flexDirection: "row", alignItems: "center", }}>
                    <Text style={s.TextMesa} >Mesa</Text>
                    <Text style={s.TextMesa2} > {mesa.nummesa}</Text>
                </View>

        </View>
    )
}


const s = StyleSheet.create({
    TextMesa: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white"
    },
    TextMesa2:{
        fontSize: 20,
        fontWeight: "bold",
        color: "white"

    }
})