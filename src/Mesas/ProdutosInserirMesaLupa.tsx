import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Cabecalho from '../components/Cabecalho';
import ModalObservacoes from '../components/ModalObservacoes';
import {useCallback, useEffect, useState} from 'react';
import {LoginInputNumeric} from '../components/LoginNumericInput';
import {LoginInputText} from '../components/LoginTextInput';

import {ButtonCustom} from '../components/Button';
import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';
import {
  MovimentoCriarMesa,
  MovimentoInsereitemcomanda,
  ProdutoPesquisaMultiEstoque,
} from '../API/api_rotas';
import {reset} from '../Rotas/NavigatorContainerRef';
import Rotas from '../Rotas/Rotas';
import {useDebug} from '../Context/debugContext';
import CardProdutoInserirItem from '../components/CardProdutoInserirItem';

export default function ProdutosInserirMesaLupa({route, navigation}: any) {
  const [showdropdownfiltropesquisa, setshowdropdownfiltropesquisa] =
    useState(false);
  const [filtropesquisa, setfiltropesquisa] = useState('Descrição');
  const [produtos, setprodutos] = useState([] as any[]);
  const [modalobservacoes, setmodalobservacoes] = useState(false);
  const [observacoespadrao, setobservacoespadrao] = useState([] as any[]);
  const [observacao, setObservacao] = useState('');
  const [conteudopesquisa, setconteudopesquisa] = useState('');
  const [ProdutoSelecionado, setProdutoSelecionado] = useState({} as any);
  const [quantidadeitemselecionado, setquantidadeitemselecionado] =
    useState('');
  const [precovendaitemselecionado, setprecovendaitemselecionado] =
    useState('');
  const [showprodinfo, setshowprodinfo] = useState(true);

  const [teclado, setteclado] = useState(false);

  const [loadingInserir, setLoadingInserir] = useState(false);

  const [idmovimento, setidmovimento] = useState('');

  const {user} = useUser();
  const {empresa} = useEmpresa();

  useEffect(() => {
    // Listener para quando o teclado aparece
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setteclado(true);
      },
    );

    // Listener para quando o teclado desaparece
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setteclado(false);
      },
    );

    // Limpa os listeners quando o componente é desmontado
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const SetProdutoselecionadoo = useCallback((item: any) => {
    setProdutoSelecionado(item);
    setquantidadeitemselecionado('1');
    setprecovendaitemselecionado(
      String(item.precovenda ? Number(item.precovenda).toFixed(2) : '').replace(
        '.',
        ',',
      ),
    );
  }, []);

  const renderItem = useCallback(
    ({item: produto}: any) => (
      <CardProdutoInserirItem
        selected={
          ProdutoSelecionado.codigobarras === produto.codigobarras &&
          ProdutoSelecionado.idestoque === produto.idestoque
        }
        produto={produto}
        setprodutoselecionado={SetProdutoselecionadoo}
        setunidadesprodutos={() => {}}
        showprodinfo={showprodinfo}
      />
    ),
    [
      ProdutoSelecionado.codigobarras,
      SetProdutoselecionadoo,
      ProdutoSelecionado.idestoque,
    ],
  );

  const InserirProdutoMovimento = useCallback(async () => {
    if (loadingInserir) return;
    setLoadingInserir(true);

    try {
      const valor = quantidadeitemselecionado;

      // normaliza vírgula para ponto
      const normalizado = valor.replace(',', '.');

      // converte para número
      const numero = Number(normalizado);

      if (!isNaN(numero)) {
        if (Number.isInteger(numero)) {
        } else {
        }
      } else {
        Alert.alert('Digite uma quantidade válida');
        return;
      }

      if (
        !ProdutoSelecionado.idproduto ||
        !precovendaitemselecionado ||
        !quantidadeitemselecionado
      ) {
        Alert.alert('Preencha todos os campos.');
        return;
      }

      const tipomovimentomesascomandas = empresa?.tipomovimentomesascomandas;

      const idusuario = user.usuario;
      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const codigoclientepadraobalcao = empresa?.codigoclientepadraobalcao;
      const idempresa = empresa?.idparametro;
      const idestoquepadraopedido = empresa?.idestoquepadraopedido;
      const codigofuncionariopadrao = user.idfuncionario;
      const idformapagtocaixa = empresa?.idformapagtocaixa;
      const nummesa = route.params.nummesa;
      const nomecliente = '';

      let idmov = route.params.idmovimento;
      if (!idmov && !idmovimento) {
        const result = await MovimentoCriarMesa({
          servername,
          serverport,
          pathbanco,
          idreferencia: codigoclientepadraobalcao,
          idempresa,
          idestoque: idestoquepadraopedido,
          idfuncionario: codigofuncionariopadrao,
          idformapagtocaixa,
          idusuario,
          nummesa,
          statusmesa: 'O',
          nomecliente,
          tipomovimento: tipomovimentomesascomandas,
        });

        setidmovimento(String(result.data.idmovimento));
        idmov = String(result.data.idmovimento);
      }

      const resultado = await MovimentoInsereitemcomanda({
        servername,
        serverport,
        pathbanco,
        idmovimento: idmov || idmovimento,
        idproduto: ProdutoSelecionado.idproduto,
        preco: precovendaitemselecionado.replace(',', '.'),
        quantidade: quantidadeitemselecionado.replace(',', '.'),
        unidade: ProdutoSelecionado.siglaunimedida, //SELECIONAR A UNIDADE DE MEDIDA DO PRODUTO SELECIONADO.
        idfuncionario: codigofuncionariopadrao,
        idusuario,
        observacoes: observacao,
        tipomovimento: empresa?.tipomovimentomesascomandas,
        idempresa,
        idestoque: ProdutoSelecionado.idestoque,
      });

      setObservacao('');
      setProdutoSelecionado({});
      setprecovendaitemselecionado('');
      setquantidadeitemselecionado('');
    } finally {
      // libera o botão SEMPRE, mesmo com erro
      setLoadingInserir(false);
    }
  }, [
    loadingInserir,
    ProdutoSelecionado,
    precovendaitemselecionado,
    quantidadeitemselecionado,
    idmovimento,
    user.servername,
    user.serverport,
    user.pathbanco,
    empresa?.codigoclientepadraobalcao,
    empresa?.idparametro,
    empresa?.idestoquepadraopedido,
    user?.idfuncionario,
    user?.usuario,
    route.params.nummesa,
    empresa?.tipomovimentomesascomandas,
    observacao,
  ]);

  const ConsultarProdutos = useCallback(
    async (pesquisa: any) => {
      // console.log(servername, serverport, pathbanco, pesquisa.length)
      const texto = (pesquisa || '').toString().trim();

      if (texto.length < 2) {
        Alert.alert('Digite pelo menos 2 caracteres no campo de pesquisa.');
        return;
      }

      const valueFiltroPesquisaProduto =
        filtropesquisa === 'Descrição'
          ? '0'
          : filtropesquisa === 'Código de Barras'
          ? '1'
          : filtropesquisa === 'Referência'
          ? '2'
          : filtropesquisa === 'GrupoProduto'
          ? '3'
          : '0';

      const servername = user.servername;
      const serverport = user.serverport;
      const pathbanco = user.pathbanco;
      const tabela = empresa?.tabelaprecosprodutopadrao;
      const idempresa = empresa?.idparametro;

      const resultado = await ProdutoPesquisaMultiEstoque({
        servername,
        serverport,
        pathbanco,
        tipopesquisa: valueFiltroPesquisaProduto,
        valorpesquisa: pesquisa,
        idmovimento: 0,
        idestoque: 1,
        comandas: '1',
        produtosprincipal: false,
        valido: 'S',
        idempresa,
        multiestoque: true,
        tabelaprecosprodutopadrao: tabela,
      });

      setprodutos(resultado.data);
      Keyboard.dismiss();
      setProdutoSelecionado({});
      setprecovendaitemselecionado('');
      setquantidadeitemselecionado('');
    },
    [
      user.servername,
      user.serverport,
      user.pathbanco,
      filtropesquisa,
      empresa?.idestoquepadraopedido,
    ],
  );
  const {debug} = useDebug();
  return (
    <View style={{flex: 1, padding: 4}}>
      <Cabecalho
        showdebug={debug ? 'idmov: ' + idmovimento : ''}
        voltarFunction={() => {
          reset(Rotas.MapaMesas);
        }}
        nummesa={route.params.nummesa}
      />

      <ModalObservacoes
        modalobservacoes={modalobservacoes}
        setmodalobservacoes={setmodalobservacoes}
        observacoespadrao={observacoespadrao}
        observacao={observacao}
        setobservacao={setObservacao}
      />

      <Text style={{color: '#3562BC', fontWeight: 'bold'}}>Filtro:</Text>

      <TouchableOpacity
        style={{height: 30}}
        onPress={() =>
          setshowdropdownfiltropesquisa(!showdropdownfiltropesquisa)
        }>
        <View
          style={{
            borderWidth: 1,
            marginTop: 3,
            borderColor: '#bdbdbdff',
            borderRadius: 8,
            padding: 2,
            marginBottom: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 35,
          }}>
          <Text style={{alignSelf: 'center'}}>{filtropesquisa}</Text>
        </View>
      </TouchableOpacity>

      {showdropdownfiltropesquisa && (
        <View
          style={{
            borderWidth: 1,
            marginTop: 5,
            borderColor: '#bdbdbdff',
            borderRadius: 8,
            padding: 2,
            marginBottom: 4,
          }}>
          {['Descrição', 'Código de Barras', 'Referência', 'GrupoProduto'].map(
            (item, index) => (
              <Pressable
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#c0c0c0ff',
                  borderStyle: 'dashed',
                  padding: 3,
                  backgroundColor:
                    filtropesquisa == item ? '#fffedcff' : '#ffffff',
                }}
                key={index}
                onPress={() => {
                  setfiltropesquisa(item);
                  setshowdropdownfiltropesquisa(false);
                }}>
                <Text>{item}</Text>
              </Pressable>
            ),
          )}
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4,
          marginTop: 8,
        }}>
        {filtropesquisa == 'Código de Barras' && (
          <TextInput
          placeholder='Digite o código do produto...'
            style={{
              borderWidth: 1,
              borderColor: '#c0c0c0ff',
              borderRadius: 10,
              flex: 1,
              marginTop: 5,
            }}
            keyboardType="numeric"
            onChangeText={setconteudopesquisa}
            value={conteudopesquisa}
          />
        )}

        {filtropesquisa != 'Código de Barras' && (
          <TextInput
          placeholder='Digite a descrição do produto...'
            style={{
              borderWidth: 1,
              borderColor: '#c0c0c0ff',
              borderRadius: 10,
              flex: 1,
              marginTop: 5,
            }}
            keyboardType="default"
            onChangeText={setconteudopesquisa}
            value={conteudopesquisa}
          />
        )}

        <TouchableOpacity
          onPress={() => ConsultarProdutos(conteudopesquisa.toUpperCase())}>
          <View>
            <Text
              style={{
                backgroundColor: '#7392CD',
                paddingHorizontal: 6,
                textAlign: 'center',
                marginLeft: 2,
                borderRadius: 10,
                padding: 4,
                marginRight: 10,
                fontSize: 18,
                alignSelf: 'center',
                color: 'white',
              }}>
              pesquisar
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {!ProdutoSelecionado.codigobarras && !(produtos.length > 0) && (
        <View
          style={{
            paddingRight: 23,

            position: 'relative',
            paddingTop: 15,
            marginBottom: 16,
          }}>
          {/* Balão de mensagem */}
          <View
            style={{
              backgroundColor: '#EDF2F7',

              padding: 12,
              borderRadius: 12,
              borderTopLeftRadius: 0,
              marginRight: 40,
              marginLeft: 16,
            }}>
            <Text
              style={{
                color: '#2D3748',
                fontSize: 14,
                lineHeight: 20,
              }}>
              <Text style={{fontWeight: '600', color: '#4FD1C5'}}>
                Pesquise{' '}
              </Text>
              algum produto
            </Text>
          </View>

          {/* Seta apontando para o botão + */}
          <View
            style={{
              position: 'absolute',
              right: 55,
              top: 8,
              width: 0,
              height: 0,
              borderLeftWidth: 12,
              borderRightWidth: 0,
              borderBottomWidth: 12,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: '#2A64D0',
              transform: [{rotate: '-90deg'}],
            }}
          />
        </View>
      )}

      {teclado && ProdutoSelecionado.codigobarras && (
        <CardProdutoInserirItem
          selected={true}
          produto={ProdutoSelecionado}
          setprodutoselecionado={SetProdutoselecionadoo}
          setunidadesprodutos={() => {}}
        />
      )}

      {!teclado && (
        <FlatList
          style={{borderColor: 'rgba(1,1,1,0)', borderWidth: 1}}
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.idproduto.toString() + index.toString()
          }
        />
      )}

      {ProdutoSelecionado.codigobarras && (
        <View style={{marginTop: 5}}>
          <TouchableOpacity
            onPress={() => setmodalobservacoes(!modalobservacoes)}>
            <Text style={{borderWidth: 1, borderRadius: 10, padding: 5}}>
              {observacao || 'Digite uma observação...'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {ProdutoSelecionado.codigobarras && (
        <View>
          <View
            style={{
              marginTop: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}>
            <TouchableOpacity
              style={{alignSelf: 'center'}}
              onPress={() => {
                if (Number(quantidadeitemselecionado) - 1 <= 0) {
                  return;
                }
                setquantidadeitemselecionado(
                  String(Number(quantidadeitemselecionado) - 1),
                );
              }}>
              <Text
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#7392CD',
                  color: 'white',
                  fontSize: 20,
                  textAlign: 'center',
                  alignSelf: 'center',
                }}>
                -
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#c0c0c0ff',
                borderRadius: 10,
                width: '30%',
                marginTop: 5,
                marginHorizontal: 5,
              }}
              placeholder="Quantidade"
              keyboardType="numeric"
              onChangeText={setquantidadeitemselecionado}
              value={quantidadeitemselecionado}
            />

            <TouchableOpacity
              style={{alignSelf: 'center'}}
              onPress={() => {
                setquantidadeitemselecionado(
                  String(Number(quantidadeitemselecionado) + 1),
                );
              }}>
              <Text
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#7392CD',
                  color: 'white',
                  fontSize: 20,
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginRight: 5,
                }}>
                +
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#c0c0c0ff',
                borderRadius: 10,
                flex: 1,
                marginTop: 5,
              }}
              placeholder="Preço"
              keyboardType="numeric"
              onChangeText={setprecovendaitemselecionado}
              value={precovendaitemselecionado}
            />
          </View>

          <ButtonCustom
            style={{marginTop: 2}}
            onPress={InserirProdutoMovimento}
            title="Inserir item"
          />
        </View>
      )}
    </View>
  );
}
