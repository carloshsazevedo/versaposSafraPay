import { StyleSheet, View } from "react-native"
import ProdutoCardCarrinho from "./CardProdutoInserirCarrinho"

const renderitemcarrinho = (item: any) => {
        return (<View style={s.viewItemCarrinho}>
            <ProdutoCardCarrinho produto={item.item}/>
                </View>
        )
    }



    const s = StyleSheet.create({
        viewItemCarrinho: {width: "100%", justifyContent: "center"}
    })


    export default renderitemcarrinho;