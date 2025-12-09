import React, {useState, useRef} from 'react';
import {Animated, Easing, Pressable, Text, View} from 'react-native';

interface InputProps {
  produto: any;
  setprodutoselecionado: (produto: any) => void;
  setunidadesprodutos: (idproduto: any) => void;
  selected: boolean;
  fluxopedidos?: boolean;
  showprodinfo?: boolean;
}

const CardProdutoInserirItem = React.memo(
  ({
    produto,
    setprodutoselecionado,
    setunidadesprodutos,
    selected,
    fluxopedidos,
    showprodinfo,
  }: InputProps) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      // Inicia a animação de escala
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1, // Aumenta ligeiramente
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1, // Volta ao tamanho original
          duration: 150,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Define o produto como selecionado
      setprodutoselecionado(produto);

      // Define as unidades do produto selecionado
      setunidadesprodutos(produto.idproduto);
    };

    // console.log(produto)
    function precotres() {
      return (
        <View
          style={{
            height: 40,
            alignSelf: 'center',
            justifyContent: 'space-between',
            padding: 2,
            flexDirection: 'row',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E6E6E6',
            width: '100%',
          }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: '#EEEEEE',
              width: '50%',
            }}>
            <Text
              style={{
                color: '#74747B',
                fontWeight: 'bold',
                alignSelf: 'center',
                paddingTop: 5,
              }}>
              P2 - {produto.siglaunimedida}
            </Text>
          </View>

          <Text
            style={{
              fontWeight: 'bold',
              color: '#74747B',
              marginRight: 3,
              paddingTop: 5,
            }}>
            R$ {String(produto.precotres?.toFixed(2)).replace('.', ',')}
          </Text>
        </View>
      );
    }

    function precoquatro() {
      return (
        <View
          style={{
            height: 40,
            alignSelf: 'center',
            justifyContent: 'space-between',
            padding: 2,
            flexDirection: 'row',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E6E6E6',
            width: '100%',
          }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: '#EEEEEE',
              width: '50%',
            }}>
            <Text
              style={{
                color: '#74747B',
                fontWeight: 'bold',
                alignSelf: 'center',
                paddingTop: 5,
              }}>
              P3 - {produto.siglaunimedida}
            </Text>
          </View>

          <Text
            style={{
              fontWeight: 'bold',
              color: '#74747B',
              marginRight: 3,
              paddingTop: 5,
            }}>
            R$ {String(produto.precoquatro?.toFixed(2)).replace('.', ',')}
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        style={{
          transform: [{scale: scaleValue}],
        }}>
        <View
          style={[{
            borderWidth: 0.5,

            borderColor: "#3562BC",
            borderBottomWidth: selected ? 5 : 1.5,

            backgroundColor: 'white',
            marginHorizontal: 3,
            borderRadius: 10,
            padding: 2,
            marginTop: 3,
          }, selected && { borderBottomColor: '#3562BC'}]}>
          <Pressable onPress={handlePress}>
            <View
              style={{
                paddingHorizontal: 4,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  width: '40%',
                  color: selected ? '#3562BC' : '#7392CD',
                  fontWeight: 'bold',
                  fontSize: selected ? 18 : 15,
                }}>
                {produto.descricao}
              </Text>

              <View
                style={{
                  height: 40,
                  alignSelf: 'center',
                  justifyContent: 'space-between',
                  padding: 2,
                  flexDirection: 'row',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E6E6E6',
                  width: '50%',
                }}>
                <View
                  style={{
                    borderRadius: 20,
                    backgroundColor: '#EEEEEE',
                    width: '50%',
                  }}>
                  <Text
                    style={{
                      color: '#74747B',
                      fontWeight: 'bold',
                      alignSelf: 'center',
                      paddingTop: 5,
                    }}>
                    {produto.siglaunimedida}
                  </Text>
                </View>

                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#74747B',
                    marginRight: 3,
                    paddingTop: 5,
                  }}>
                  R$ {String(produto.precovenda.toFixed(2)).replace('.', ',')}
                </Text>
              </View>
            </View>

            {!!produto.precotres ||
              (!!produto.precoquatro && (
                <View style={{flexDirection: 'row'}}>
                  <Text style={{width: '50%'}}>
                    {!!produto.precotres && precotres()}
                  </Text>
                  <Text style={{width: '50%'}}>
                    {!!produto.precoquatro && precoquatro()}
                  </Text>
                </View>
              ))}

            {showprodinfo && (
              <View style={{flexDirection: 'row'}}>
                <Text style={{marginRight: 10, color: '#b9b9b9ff'}}>
                  cod. barra: {produto.codigobarras}
                </Text>
                <Text style={{marginRight: 10, color: '#b9b9b9ff'}}>
                  idestoque: {produto.idestoque}
                </Text>
                <Text style={{color: '#b9b9b9ff'}}>
                  qtd: {produto.qtdestoque}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </Animated.View>
    );
  },
);

export default CardProdutoInserirItem;
