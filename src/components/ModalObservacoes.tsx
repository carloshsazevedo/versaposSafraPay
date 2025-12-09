import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';
import {ConsultaObservacoes} from '../API/api_rotas';

export default function ModalObservacoes({
  modalobservacoes,
  setmodalobservacoes,
  observacoespadrao,
  observacao,
  setobservacao,
}: any) {
  const [carregando, setCarregando] = useState(false);
  const [obsPadrao, setObsPadrao] = useState<any[]>([]);
  const {user} = useUser();
  const {empresa} = useEmpresa();
  function adicionarObservacaoPadrao(texto: string) {
    // adiciona a string ao conteúdo atual
    const novo = observacao ? observacao + ' ' + texto : texto;
    setobservacao(novo);
  }

  function fecharModal() {
    setmodalobservacoes(false);
  }

  const adicionarObs = (descricao: string) => {
    const novoTexto = observacao ? observacao + ' | ' + descricao : descricao;

    setobservacao(novoTexto);
  };

  useEffect(() => {
    if (!modalobservacoes) return; // só carrega quando o modal abre

    async function carregarObs() {
      try {
        setCarregando(true);

        const servername = user.servername;
        const serverport = user.serverport;
        const pathbanco = user.pathbanco;
        const idempresa = empresa?.idparametro;

        const result = await ConsultaObservacoes({
          servername: servername,
          serverport: serverport,
          pathbanco: pathbanco,
          idempresa: idempresa,
        });

        console.log('Resultado ConsultaObservacoes:', result.data);

        const ativos = result.data.filter((o: any) => o.ativo === 'S');

        setObsPadrao(ativos);
      } catch (err) {
        console.log('Erro ao carregar observações:', err);
      } finally {
        setCarregando(false);
      }
    }

    carregarObs();
  }, [modalobservacoes]);

  return (
    <Modal visible={modalobservacoes} transparent animationType="slide">
      <View style={styles.containerFundo}>
        <View style={styles.containerModal}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.titulo}>Observações</Text>
            <TouchableOpacity onPress={fecharModal}>
              <Text style={styles.botaoFechar}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de observações padrão */}
          <ScrollView style={styles.lista}>
            {observacoespadrao.map((item: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => adicionarObservacaoPadrao(item)}
                style={styles.item}>
                <Text style={styles.itemTexto}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Big Text Input */}
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Digite suas observações..."
            value={observacao}
            onChangeText={setobservacao}
          />
          {/* Lista de observações padrão */}
          <Text style={styles.subtitulo}>Observações rápidas:</Text>

          <ScrollView style={{maxHeight: 180}}>
            {carregando ? (
              <Text style={{fontStyle: 'italic'}}>Carregando...</Text>
            ) : obsPadrao.length === 0 ? (
              <Text style={{fontStyle: 'italic'}}>
                Nenhuma observação padrão encontrada.
              </Text>
            ) : (
              obsPadrao.map((o, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.obsItem}
                  onPress={() => adicionarObs(o.descricao)}>
                  <Text style={styles.obsDescricao}>{o.descricao}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Botão Concluir */}
          <TouchableOpacity style={styles.btnConcluir} onPress={fecharModal}>
            <Text style={styles.btnConcluirTexto}>Concluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 15,
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  obsDescricao: {
    fontSize: 16,
  },
  containerModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  obsItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  botaoFechar: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lista: {
    maxHeight: 200,
    marginVertical: 10,
  },
  item: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 5,
  },
  itemTexto: {
    fontSize: 16,
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginTop: 10,
  },
  btnConcluir: {
    backgroundColor: '#3562BC',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  btnConcluirTexto: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
