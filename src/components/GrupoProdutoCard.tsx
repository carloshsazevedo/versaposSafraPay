
import { View, Text, Image } from "react-native";

interface InputProps {
    imagem?: any,
    descricao?: string
}

export default function GrupoProdutoCard({
    imagem,
    descricao
}: InputProps){
    
    /*useEffect(() => {console.log(imagem)})*/

    
    return (
        
            <View style={{ alignSelf:"center",   }}>
        
            <Image
                
                
                style={{width: 160, height:160, alignSelf: "center", marginTop: 5}}
                alt="GrupoProduto"
                source={imagem}
            />
            <Text style={{marginTop: -20, fontWeight: "bold", color: "white", alignSelf: "center", }}>{descricao}</Text>
            </View>

    )
}