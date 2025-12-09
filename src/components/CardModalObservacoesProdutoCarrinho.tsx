import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import {useUser} from '../Context/userContext';
import {useEmpresa} from '../Context/empresaContext';
import {ConsultaObservacoes} from '../API/api_rotas';

export default function ModalObservacao({
  visible,
  onClose,
  onSave,
  initialValue,
}: any) {
  const [texto, setTexto] = useState(initialValue || '');
  const [obsPadrao, setObsPadrao] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const {user} = useUser();
  const {empresa} = useEmpresa();

  // 👉 Carregar lista de observações do backend
  useEffect(() => {
    if (!visible) return; // só carrega quando o modal abre

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
  }, [visible]);

  // 👉 Incrementar texto ao clicar em um item padrão
  const adicionarObs = (descricao: string) => {
    const novoTexto = texto ? texto + ' | ' + descricao : descricao;

    setTexto(novoTexto);
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.titulo}>Observações</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite observações..."
            value={texto}
            onChangeText={setTexto}
            multiline
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

          <View style={styles.botoes}>
            <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
              <Text style={styles.txtBtn}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={() => {
                onSave(texto);
                onClose();
              }}>
              <Text style={[styles.txtBtn, {color: 'white'}]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  box: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#EEE',
    padding: 10,
    minHeight: 80,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  obsItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  obsDescricao: {
    fontSize: 16,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  btnCancelar: {
    padding: 10,
    marginRight: 15,
  },
  btnSalvar: {
    backgroundColor: '#2A64D0',
    padding: 10,
    borderRadius: 8,
  },
  txtBtn: {
    fontSize: 16,
  },
});
