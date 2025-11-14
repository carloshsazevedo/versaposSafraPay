// import {  faUtensils } from "@fortawesome/free-solid-svg-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { Text, View } from "react-native"

const CardMesaDisponivel = ({nummesa} : any) => {


    return (
        
          <View style={{
            marginTop: 10,
            marginBottom: 16,
            padding: 16,
            backgroundColor: '#F5F7FA',
            borderRadius: 12,
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}>
            {/* Ícone moderno - você pode usar MaterialIcons, FontAwesome, etc. */}
            {/* <FontAwesomeIcon
              icon={faUtensils as any}
              size={32}
              color="#2A64D0"
              style={{ marginBottom: 8 }}
            /> */}

            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#2D3748',
              marginBottom: 4,
            }}>
              Mesa {nummesa} disponível!
            </Text>

            <Text style={{
              fontSize: 14,
              color: '#718096',
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Adicione produtos para iniciar o pedido
            </Text>
          </View>
    )
}


export default CardMesaDisponivel;