import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarrinho } from '../Context/carrinhoContext';
import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';
import { ProdutoImagemProduto } from '../API/api_rotas';
import ModalObservacao from './CardModalObservacoesProdutoCarrinho';

const ProdutoCardCarrinho = React.memo(
  ({ produto, onObservacao }: { produto: any; onObservacao: () => void }) => {
  const { setCarrinho, alterarObservacao } = useCarrinho();

  const [modalVisible, setModalVisible] = useState(false);

  async function handleAdd() {
    setCarrinho(prev => {
      return prev.map(item =>
        item.idproduto === produto.idproduto
          ? {
              ...item,
              quantidade: item.quantidade + 1,
            }
          : item,
      );
    });
    
  }

  async function handleRemove() {
    setCarrinho(prev =>
      prev.reduce((acc, item) => {
        if (item.idproduto === produto.idproduto) {
          if (item.quantidade > 1) {
            // Diminui 1 unidade
            acc.push({ ...item, quantidade: item.quantidade - 1 });
          }
          // Se tiver 1 unidade, simplesmente não adiciona (ou seja, remove)
        } else {
          // Mantém os outros produtos normalmente
          acc.push(item);
        }
        return acc;
      }, [] as typeof prev),
    );
  }

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
    <View style={styles.mainview}>
      <View style={styles.view1}>
        <Image
          style={styles.image}
          alt="ImgProduto"
          source={
            imagemBanco
              ? {
                  uri:
                    imagemBanco ||
                    'https://cdn-icons-png.freepik.com/256/5544/5544155.png',
                }
              : require('../assets/Images/ProdutoSemImagem.png')
          }
          borderRadius={15}
        />
      </View>

      <View style={styles.view2}>
        <Text style={styles.textdescricao}>{produto.descricao}</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.view3}>
            <View style={styles.view4}>
              <Text style={styles.textobservacao}>
                {produto.observacoes
                  ? produto.observacoes
                  : 'Adicionar observações...'}
              </Text>
            </View>

            <Image
              style={styles.view5}
              alt="ImgProduto"
              source={require('../assets/Images/icon_Observacao.png')}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.view6}>
          <Text style={styles.textprecovenda}>
            R$ {String(produto.precovenda.toFixed(2)).replace('.', ',')}
          </Text>

          <View style={styles.view7}>
            <TouchableOpacity
              onPress={() => {
                handleRemove();
              }}
            >
              <Image
                style={styles.image1}
                alt="ImgProduto"
                source={require('../assets/Images/icon_botaoMenos.png')}
              />
            </TouchableOpacity>
            <Text style={styles.textquantidade}>{produto.quantidade}</Text>
            <TouchableOpacity
              onPress={() => {
                handleAdd();
              }}
            >
              <Image
                style={styles.image1}
                alt="ImgProduto"
                source={require('../assets/Images/icon_botaoMais.png')}
              />
            </TouchableOpacity>
          </View>

          {/* <Button onPress={handleRemove}>-</Button>
          <Text mx={2}>{quantidade}</Text>
          <Button onPress={handleAdd}>+</Button> */}
        </View>
      </View>

      <ModalObservacao
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialValue={produto.observacoes}
        onSave={(texto: string) => {
          alterarObservacao(produto.idproduto, texto);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  mainview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 15,
    paddingLeft: 2,
    marginTop: 5,
    width: '90%',
    height: 125,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  view1: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#E9E9E9',
    marginRight: 3,
  },
  view2: { width: '65%', justifyContent: 'space-between' },
  textdescricao: {
    fontWeight: 'bold',
    color: '#2A64D0',
    fontSize: 14,
    maxHeight: 50,
  },
  view3: { flexDirection: 'row', justifyContent: 'space-around' },
  view4: {
    width: '78%',
    height: 30,
    borderColor: '#BDBEC0',
    borderRadius: 5,
    borderWidth: 1,
  },
  textobservacao: { color: '#BDBEC0', marginLeft: 3 },
  view5: {
    width: 20,
    height: 20,
    marginLeft: 2,
    marginTop: 1,
    alignSelf: 'center',
  },
  textprecovenda: { fontWeight: 'bold', color: '#2A64D0', fontSize: 28 },
  view6: { flexDirection: 'row', justifyContent: 'space-between' },
  image1: {
    width: 25,
    height: 25,
    opacity: 0.5,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderRadius: 8,
  },
  textquantidade: {
    marginTop: -2,
    color: '#2A64D0',
    fontSize: 25,
    marginHorizontal: 3,
  },
  view7: { flexDirection: 'row', paddingRight: 10 },
});

export default ProdutoCardCarrinho;
