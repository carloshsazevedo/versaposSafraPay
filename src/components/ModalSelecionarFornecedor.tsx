import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  ConsultaFornecedorParceiro,
  UpdateFornecedorMovimento,
} from '../API/api_rotas';
import { useUser } from '../Context/userContext';
import { useEmpresa } from '../Context/empresaContext';
import { reset } from '../Rotas/NavigatorContainerRef';
import Rotas from '../Rotas/Rotas';

const ModalSelecionarFornecedor = ({ visible, onClose, idmovimento, nummesa, statusmesa }: any) => {
  const [filtro, setFiltro] = useState('Nome');
  const [pesquisa, setPesquisa] = useState('');
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<any>(null);
  const [pesquisando, setpesquisando] = useState(false);

  const { user } = useUser();
  const { empresa } = useEmpresa();

  const filtros = useMemo(
    () => ['Nome', 'IdFornecedor', 'CNPJ', 'Apelido'],
    [],
  );

  const pesquisarFornecedores = async () => {
    if (
      pesquisa.length < 3 &&
      (filtro === 'Nome' || filtro === 'Apelido' || filtro === 'CNPJ')
    ) {
      Alert.alert(
        'Alerta',
        'Digite pelo menos 3 caracteres no campo de pesquisa',
      );
      return;
    }
    if (pesquisa.length < 1 && filtro === 'IdFornecedor') {
      Alert.alert(
        'Alerta',
        'Digite pelo menos 1 caractere no campo de pesquisa',
      );
      return;
    }

    setpesquisando(true);
    setFornecedores([]);
    const servername = user.servername;
    const serverport = user.serverport;
    const pathbanco = user.pathbanco;
    const idempresa = empresa?.idparametro;

    try {
      const resultado = await ConsultaFornecedorParceiro({
        serverport: serverport,
        servername: servername,
        pathbanco: pathbanco,
        tipopesquisa:
          filtro === 'Nome'
            ? '0'
            : filtro === 'IdFornecedor'
            ? '1'
            : filtro === 'CNPJ'
            ? '2'
            : filtro === 'Apelido'
            ? '3'
            : '0',
        pesquisa: pesquisa.toUpperCase(),
        idempresa: idempresa,
      });

      // Alert.alert('Resultado: ', JSON.stringify(resultado.data));

      setFornecedores(resultado.data);
    } catch (error: any) {
      Alert.alert('Alerta', JSON.stringify(error?.message ?? error));
    } finally {
      setpesquisando(false);
    }
  };

  const selecionarFornecedor = async () => {
    try {
      if (fornecedorSelecionado) {
        updateFornecedor();
      } else {
        Alert.alert('Selecione um fornecedor!');
      }
    } catch (error) {
    } finally {
      onClose();
    }
  };

  const cancelar = () => {
    setFornecedorSelecionado(null);
    onClose();
  };

  const updateFornecedor = useCallback(async () => {
    const servername = user.servername;
    const serverport = user.serverport;
    const pathbanco = user.pathbanco;
    const idempresa = empresa?.idparametro;

    const resultado = await UpdateFornecedorMovimento({
      serverport: serverport,
      servername: servername,
      pathbanco: pathbanco,
      idfornecedor: fornecedorSelecionado.idfornecedor,
      idmovimento: idmovimento,
      idempresa: idempresa,
    });

    if (resultado) {
      
      const dataenviar = new Date();

      reset(Rotas.Mesa, {
                      idmovimento: idmovimento,
                      nummesa: nummesa,
                      data: `${dataenviar}`,
                      statusmesa: statusmesa,
                    });
    }
    // Alert.alert("Resultado: ",JSON.stringify(resultado.data))
  }, [fornecedorSelecionado]);

  const handleSelecionarItem = useCallback((item: any) => {
    setFornecedorSelecionado(item);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Selecione um Fornecedor</Text>

          {/* Filtro de pesquisa */}
          <View style={styles.filterContainer}>
            {filtros.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterOption,
                  filtro === item && styles.filterSelected,
                ]}
                onPress={() => setFiltro(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filtro === item && styles.filterTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de pesquisa */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Pesquisar por ${filtro}`}
              value={pesquisa}
              onChangeText={setPesquisa}
            />
            {pesquisando ? (
              <ActivityIndicator size={'small'} />
            ) : (
              <Button
                title="Pesquisar"
                onPress={() => {
                  pesquisarFornecedores();
                  setFornecedorSelecionado(null);
                }}
              />
            )}
          </View>

          {/* Lista de fornecedores */}
          <FlatList
            data={fornecedores}
            keyExtractor={item => item.idfornecedor.toString()}
            style={styles.list}
            renderItem={({ item }) => (
              <FornecedorItem
                item={item}
                selecionado={
                  fornecedorSelecionado?.idfornecedor === item.idfornecedor
                }
                onPress={handleSelecionarItem}
              />
            )}
          />

          {/* Botões inferiores */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelar}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.selectButton]}
              onPress={() => selecionarFornecedor()}
              disabled={!fornecedorSelecionado}
            >
              <Text style={styles.buttonText}>Selecionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalSelecionarFornecedor;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 16,
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  filterOption: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterSelected: {
    backgroundColor: '#007bff33',
    borderColor: '#007bff',
  },
  filterText: {
    color: '#555',
  },
  filterTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    height: 40,
  },
  list: {
    flexGrow: 0,
    marginBottom: 12,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listItemSelected: {
    backgroundColor: '#007bff22',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSub: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  selectButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const FornecedorItem = React.memo(({ item, selecionado, onPress }: any) => {
  return (
    <TouchableOpacity
      style={[styles.listItem, selecionado && styles.listItemSelected]}
      onPress={() => onPress(item)}
    >
      <Text style={styles.listItemText}>{item.nome}</Text>
      <Text style={styles.listItemSub}>CNPJ: {item.cnpj}</Text>
      <Text style={styles.listItemSub}>Apelido: {item.apelido}</Text>
    </TouchableOpacity>
  );
});
