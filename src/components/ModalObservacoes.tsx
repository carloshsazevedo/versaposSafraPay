import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";

export default function ModalObservacoes({
  modalobservacoes,
  setmodalobservacoes,
  observacoespadrao,
  observacao,
  setobservacao
}: any) {

  function adicionarObservacaoPadrao(texto: string) {
    // adiciona a string ao conteúdo atual
    const novo = observacao ? observacao + " " + texto : texto;
    setobservacao(novo);
  }

  function fecharModal() {
    setmodalobservacoes(false);
  }

  return (
    <Modal
      visible={modalobservacoes}
      transparent
      animationType="slide"
    >
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
                style={styles.item}
              >
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 15
  },
  containerModal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    maxHeight: "90%"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold"
  },
  botaoFechar: {
    fontSize: 20,
    fontWeight: "bold"
  },
  lista: {
    maxHeight: 200,
    marginVertical: 10
  },
  item: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 5
  },
  itemTexto: {
    fontSize: 16
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    marginTop: 10
  },
  btnConcluir: {
    backgroundColor: "#3562BC",
    padding: 12,
    borderRadius: 10,
    marginTop: 15
  },
  btnConcluirTexto: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
