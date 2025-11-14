import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../ThemeContext/colors';
import { ProdutoImagemProduto } from '../API/api_rotas';
import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';

const ProdutoCard = React.memo(
  ({
    produto,
    handleInsert,
  }: {
    produto: any;
    handleInsert: (produto: any, quantidade: number) => void;
  }) => {
    const [imagemBanco, setImagemBanco] = useState('');
    const { user } = useUser();
    const { empresa } = useEmpresa();

    useEffect(() => {
      async function fetchImagem() {
        const servername = user.servername;
        const serverport = user.serverport;
        const pathbanco = user.pathbanco;
        const idempresa = empresa?.idparametro;

        if (produto.imagemcadastro) {
          const resultado = await ProdutoImagemProduto({
            servername,
            serverport,
            pathbanco,
            idproduto: produto.idproduto,
            idempresa,
          });
          console.log('resultado: ', JSON.stringify(resultado));
          if (resultado.data?.imagem) {
            setImagemBanco(`data:image/png;base64,${resultado.data?.imagem}`);
          }
        } else {
        }
      }
      fetchImagem();
    }, [produto.imagemcadastro]);

    return (
      <View style={styles.card}>
        <View style={styles.idsview}>
          <Text style={styles.txtidproduto}>{produto.idproduto}</Text>
          <Text style={styles.txtidestoque}>{produto.qtdestoque}</Text>
          <Text style={styles.txtidestoque}>{produto.idestoque}</Text>
        </View>
        <Image
          style={styles.image}
          alt="ImgProduto"
          //   source={require('../assets/Images/ProdutoSemImagem.png')}
          source={
            imagemBanco
              ? {
                  uri:
                    imagemBanco ||
                    'https://cdn-icons-png.freepik.com/256/5544/5544155.png',
                }
              : require('../assets/Images/ProdutoSemImagem.png')
          }
        />
        <View style={styles.view1}>
          <View style={styles.view2}>
            <Text style={styles.txtdescricao}>{produto.descricao}</Text>
          </View>
          <View>
            <Text style={styles.txtprecovenda}>
              R$ {String(produto.precovenda?.toFixed(2)).replace('.', ',')}
            </Text>
          </View>
        </View>
        {/* <Text fontSize={12} color="#2A64D0">
        {`Quantidade: ${produto.quantidade} ${produto.siglaunimedida}`}
      </Text> */}

        <TouchableOpacity
          onPress={() => {
            handleInsert(produto, 1);
          }}
        >
          <View style={styles.view4}>
            <Text style={styles.txtinserir}>Inserir</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    padding: 14,
    justifyContent: 'space-between',
    width: '48%',
    marginRight: 5,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: colors.CinzaClaro,
    borderWidth: 1,
  },
  txtidproduto: { fontWeight: 'bold', color: '#2A64D0', fontSize: 16 },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: '#E9E9E9',
    borderRadius: 8,
    marginBottom: 3,
  },
  view1: { flexDirection: 'row', justifyContent: 'space-between' },
  view2: { width: '50%' },
  txtdescricao: { fontWeight: 'bold', color: '#2A64D0', fontSize: 14 },
  txtprecovenda: { fontWeight: 'bold', color: '#2A64D0', fontSize: 18 },

  view4: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderColor: '#2A64D0',
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.8,
    paddingVertical: 2,
  },
  txtinserir: { alignSelf: 'center', color: '#2A64D0' },
  idsview: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  txtidestoque: {
    color: '#c7c7c7ff',
  },
});

export default ProdutoCard;
