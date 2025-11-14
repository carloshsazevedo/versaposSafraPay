import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import renderitemcarrinho from './renderItemCarrinho';
import { ButtonCustom } from './Button';
import CardNumMesa from './CardNumMesa';
import { reset } from '../Rotas/NavigatorContainerRef';
import Rotas from '../Rotas/Rotas';
import { useEmpresa } from '../Context/empresaContext';
import { useUser } from '../Context/userContext';
import {
  MovimentoCriarMesa,
  MovimentoInserirItensCarrinhoMesa,
} from '../API/api_rotas';
import { useCarrinho } from '../Context/carrinhoContext';

interface CarrinhoProps {
  nummesa?: any;
  statusmesa?: any;
  idmovimento: any;
  carrinhoAberto: any;
  setCarrinhoAberto: (item: any) => void;
}

const Carrinho = ({
  nummesa,
  statusmesa,
  idmovimento,
  carrinhoAberto,
  setCarrinhoAberto
}: CarrinhoProps) => {

  const { empresa } = useEmpresa();
  const { user } = useUser();
  const {carrinho, setCarrinho} = useCarrinho();

  async function InserirProdutosMovimentoCarrinho() {
    let idmov = idmovimento;

    if (carrinho.length === 0) {
      const data = new Date();

      reset(Rotas.Mesa, {
        idmovimento: idmov,
        nummesa: nummesa,
        data: `${data}`,
        statusmesa: statusmesa,
      });

      return null;
    }

    const servername = user.servername;
    const serverport = user.serverport;
    const pathbanco = user.pathbanco;
    const idempresa = empresa?.idparametro;
    const codigoclientepadraobalcao = empresa?.codigoclientepadraobalcao;
    const idestoquepadraopedido = empresa?.idestoquepadraopedido;
    const codigofuncionariopadrao = user.idfuncionario;
    const idformapagtocaixa = empresa?.idformapagtocaixa;
    const idusuario = user.usuario;
    const tipomovimentomesascomandas = empresa?.tipomovimentomesascomandas;

    if (!idmov) {
      // console.log('checkpoint 0')
      const result = await MovimentoCriarMesa({
        servername,
        serverport,
        pathbanco,
        idreferencia: codigoclientepadraobalcao,
        idempresa,
        idestoque: idestoquepadraopedido,
        idfuncionario: codigofuncionariopadrao,
        idformapagtocaixa,
        usuarioinc: idusuario,
        nummesa,
        statusmesa: 'O',
        nomecliente: '',
        tipomovimento: tipomovimentomesascomandas ?? 'B',
      });
      // console.log('checkpoint 1')

      // Alert.alert(
      //   'Mesa aberta com sucesso! nummesa: ' + JSON.stringify(result.data?.nummesa),
      // );

      idmov = String(result.data?.idmovimento);
    }
    
    console.log('checkpoint 2')
    const resultado = await MovimentoInserirItensCarrinhoMesa({
      servername,
      serverport,
      pathbanco,
      idmovimento: idmov,
      idusuario,
      produtos: carrinho,
      codigofuncionariopadrao,
      idempresa,
    });
    console.log(resultado?.data)
    // Alert.alert(
    //   'Produto(s) inserido(s) com sucesso!',
    //   JSON.stringify(resultado.data),
    // );

    const data = new Date();
    setCarrinho([])
    reset(Rotas.Mesa, {
      idmovimento: idmov,
      nummesa: nummesa,
      data: `${data}`,
      statusmesa: 'O',
    });
  }

  return (
    <View style={[s.Footer, carrinhoAberto && s.mainv]}>
      
      <View style={s.footerheader}>
        <TouchableOpacity
          onPress={() => {
            setCarrinhoAberto(!carrinhoAberto);
          }}
        >
          <CardNumMesa mesa={{ nummesa: nummesa, statusmesa: statusmesa }} />
        </TouchableOpacity>

        <ButtonCustom
          title="Concluir"
          onPress={() => {
            InserirProdutosMovimentoCarrinho();
          }}
          style={s.ButtomConcluir}
        />
      </View>

      <FlatList
      // ListHeaderComponent={<View><Text>{JSON.stringify(carrinho)}</Text></View>}
        data={carrinho}
        renderItem={renderitemcarrinho}
        keyExtractor={item => item.codigobarras}
      />
    </View>
  );
};

const s = StyleSheet.create({
  Footer: {
    maxHeight: '45%',
    height: 60,

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  footerheader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ButtomConcluir: {
    height: 55,
    justifyContent: 'center',
    fontWeight: 'bold',
    width: 160,
  },
  mainv: { height: '45%' }
});

export default Carrinho;
