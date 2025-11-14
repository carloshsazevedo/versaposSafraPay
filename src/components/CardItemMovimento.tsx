// import { faWarning } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Modal } from 'react-native';

const CardItemMovimento = ({
  itemmovimento,
  onPressExcluir,
}: {
  itemmovimento: any;
  onPressExcluir?: (iditemmovimento: any) => void;
}) => {
  function formatTime(isoString: any) {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  return (
    <View style={s.MainView}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#7392CD', fontWeight: 'bold', width: '80%' }}>
          {itemmovimento.quantidade
            .toFixed(3)
            .replace('.', ',')
            .replace(',000', '')}
          x {itemmovimento.nomeproduto}
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <Image
            alt={'relogio'}
            style={{
              width: 15,
              height: 15,
              marginRight: 2,
              alignSelf: 'center',
            }}
            source={require('../assets/Images/icon_utilizacao.png')}
          />

          <Text style={{ color: '#7392CD' }}>
            {formatTime(itemmovimento.datainc)}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            justifyContent: 'space-between',
            padding: 2,
            flexDirection: 'row',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E6E6E6',
            width: '48%',
          }}
        >
          <View
            style={{
              borderRadius: 20,
              backgroundColor: '#EEEEEE',
              width: '40%',
            }}
          >
            <Text
              style={{
                color: '#74747B',
                fontWeight: 'bold',
                alignSelf: 'center',
              }}
            >
              {' '}
              {itemmovimento.siglaunimedida}
            </Text>
          </View>

          <Text
            style={{ fontWeight: 'bold', color: '#74747B', marginRight: 3 }}
          >
            R${' '}
            {String(itemmovimento.precooriginal.toFixed(2)).replace('.', ',')}
          </Text>
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            padding: 2,
            flexDirection: 'row',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E6E6E6',
            width: '48%',
          }}
        >
          <View
            style={{
              borderRadius: 20,
              backgroundColor: '#EEEEEE',
              width: '40%',
            }}
          >
            <Text
              style={{
                color: '#74747B',
                fontWeight: 'bold',
                alignSelf: 'center',
              }}
            >
              Total
            </Text>
          </View>

          <Text
            style={{ fontWeight: 'bold', color: '#74747B', marginRight: 3 }}
          >
            R$ {String(itemmovimento.totalitem.toFixed(2)).replace('.', ',')}
          </Text>
        </View>
      </View>

      {itemmovimento.descricaoitemmovimento && (
        <>
          {/* <FontAwesomeIcon icon={faWarning as any} color={'#dd5353ff'} /> */}
          <Text
            style={{
              backgroundColor: '#edf0faff',
              borderRadius: 10,
              padding: 10,
              color: '#e49338ff',
            }}
          >
            {itemmovimento.descricaoitemmovimento}
          </Text>
        </>
      )}

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            alt={'icon_garcomcinza'}
            style={{ width: 25, height: 25 }}
            source={require('../assets/Images/icon_garcomcinza.png')}
          />
          <Text
            style={{
              marginLeft: 2,
              color: '#74747B',
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            Garçom:
          </Text>
          <Text
            style={{
              marginLeft: 1,
              color: '#74747B',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            {itemmovimento.usuarioinc}
          </Text>
        </View>

        <TouchableOpacity onPress={() => {}}>
          <Image
            style={{ width: 20, height: 20, marginLeft: 2, marginTop: 1 }}
            alt="ImgProduto"
            source={require('../assets/Images/icon_Observacao.png')}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setItemToDelete(itemmovimento.iditemmovimento);
            setShowConfirm(true);
          }}
        >
          <Image
            alt={'icon_lixeira'}
            style={{ width: 25, height: 25 }}
            source={require('../assets/Images/icon_lixeira.png')}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              width: '80%',
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}
            >
              Deseja realmente excluir este item?
            </Text>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: '#E6E6E6',
                  padding: 10,
                  borderRadius: 10,
                  width: '45%',
                  alignItems: 'center',
                }}
                onPress={() => setShowConfirm(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#dd5353',
                  padding: 10,
                  borderRadius: 10,
                  width: '45%',
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (onPressExcluir) onPressExcluir(itemToDelete);
                  setShowConfirm(false);
                }}
              >
                <Text style={{ color: 'white' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  MainView: {
    marginTop: 3,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#7392CD',
    padding: 5,
  },
});

export default CardItemMovimento;
