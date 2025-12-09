import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import Cabecalho from '../components/Cabecalho';
import Rotas from '../Rotas/Rotas';
import {reset} from '../Rotas/NavigatorContainerRef';
import {useState} from 'react';
import {MesaTransferirItensMesa} from '../API/api_rotas';
import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';

// Tipagem completa do item da mesa
interface ItemMovimento {
  iditemmovimento: number;
  nomeproduto: string;
  quantidade: number;
  preco: number;
  totalitem?: number;
  codigobarras?: string;
  precooriginal?: number;
  siglaunimedida?: string;
  [key: string]: any;
}

export default function TransferirMesa({navigation, route}: any) {
  const itensOriginais: ItemMovimento[] = route.params.itensmovimento || [];
  const mesaAtual = route.params.nummesaatual;
  const mesaDestino = route.params.nummesatransferir;

  const {user} = useUser();
  const {empresa} = useEmpresa();

  const [itensMesaAtual, setItensMesaAtual] =
    useState<ItemMovimento[]>(itensOriginais);
  const [itensTransferidos, setItensTransferidos] = useState<ItemMovimento[]>(
    [],
  );

  // Move 1 item de um lado para o outro
  function moverItem(item: ItemMovimento, origem: 'A' | 'B') {
    if (origem === 'A') {
      setItensMesaAtual(prev =>
        prev.filter(i => i.iditemmovimento !== item.iditemmovimento),
      );
      setItensTransferidos(prev => [...prev, item]);
    } else {
      setItensTransferidos(prev =>
        prev.filter(i => i.iditemmovimento !== item.iditemmovimento),
      );
      setItensMesaAtual(prev => [...prev, item]);
    }
  }

  // Mover todos os itens da mesa atual para a mesa destino
  function moverTodos() {
    setItensTransferidos(prev => [...prev, ...itensMesaAtual]);
    setItensMesaAtual([]);
  }

  // Finaliza a transferência
  async function confirmarTransferencia() {
    const servername = user.servername;
    const serverport = user.serverport;
    const pathbanco = user.pathbanco;
    const idempresa = empresa?.idparametro;
    const idusuario = user.usuario;
    try {
      const result2 = await MesaTransferirItensMesa({
        serverport: serverport,
        servername: servername,
        pathbanco: pathbanco,
        idusuario: idusuario,
        itensmovimentoinserir: itensTransferidos,
        idmovimentoorigem: route.params.idmovimento,
        nummesadestino: route.params.nummesatransferir,
        idempresa: idempresa,
      });


      reset(Rotas.MapaMesas)
    } catch (error) {

        Alert.alert('Erro:', JSON.stringify(error))
    }
  }

  // Renderiza um card de item
  const renderItem = (item: ItemMovimento, origem: 'A' | 'B') => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => moverItem(item, origem)}>
      <Text style={styles.itemText}>{item.nomeproduto}</Text>
      <Text style={styles.subText}>
        Qtd: {item.quantidade} — R$ {item.preco.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Cabecalho voltarFunction={() => reset(Rotas.MapaMesas)} />

      <Text style={styles.title}>Transferir itens</Text>
      <Text style={styles.subTitle}>
        Mesa {mesaAtual} ➜ Mesa {mesaDestino}
      </Text>

      {/* --- LISTA DA MESA ATUAL --- */}
      <Text style={styles.sectionTitle}>Itens da mesa {mesaAtual}</Text>

      <FlatList
        data={itensMesaAtual}
        keyExtractor={item => String(item.iditemmovimento)}
        renderItem={({item}) => renderItem(item, 'A')}
        style={styles.list}
      />

      {itensMesaAtual.length > 0 && (
        <TouchableOpacity style={styles.btnAll} onPress={moverTodos}>
          <Text style={styles.btnAllText}>Transferir TODOS →</Text>
        </TouchableOpacity>
      )}

      {/* --- LISTA DA MESA DESTINO --- */}
      <Text style={styles.sectionTitle}>Itens para mesa {mesaDestino}</Text>

      <FlatList
        data={itensTransferidos}
        keyExtractor={item => String(item.iditemmovimento)}
        renderItem={({item}) => renderItem(item, 'B')}
        style={styles.list}
      />

      {/* CONFIRMAR */}
      <TouchableOpacity
        style={[
          styles.btnConfirmar,
          itensTransferidos.length === 0 && {backgroundColor: '#999'},
        ]}
        disabled={itensTransferidos.length === 0}
        onPress={confirmarTransferencia}>
        <Text style={styles.btnConfirmarText}>Confirmar Transferência</Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------- ESTILOS ---------------------

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },

  subTitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },

  list: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 10,
  },

  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },

  subText: {
    fontSize: 12,
    opacity: 0.6,
  },

  btnAll: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },

  btnAllText: {
    color: '#fff',
    fontSize: 16,
  },

  btnConfirmar: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 10,
    marginTop: 20,
  },

  btnConfirmarText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
