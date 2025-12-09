import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import EyeAnimation from './EyeAnimation';

const Cliente = React.memo(({ nome }: { nome?: string }) => (
  <View style={s.ViewMesaInfoItem}>
    <View style={s.imageiconiteminfomesawrapper}>
      <Image
        alt="icon_cliente"
        style={s.imageIconInfoMesaItem1}
        source={require('../assets/Images/icon_cliente.png')}
      />
    </View>
    <Text style={s.textItemMesaInfo}> Cliente: </Text>
    <Text style={s.textValorItemMesaInfo}> {nome} </Text>
  </View>
));

const Garcom = React.memo(({ nome }: { nome?: string }) => (
  <View style={s.ViewMesaInfoItem}>
    <View style={s.imageiconiteminfomesawrapper}>
      <Image
        alt="icon_garcom"
        style={s.imageIconInfoMesaItem2}
        source={require('../assets/Images/icon_garcom.png')}
      />
    </View>
    <Text style={s.textItemMesaInfo}> Garçom: </Text>
    <Text style={s.textValorItemMesaInfo}> {nome} </Text>
  </View>
));

const Abertura = React.memo(({ abertura }: { abertura?: string }) => (
  <View style={s.ViewMesaInfoItem}>
    <View style={s.imageiconiteminfomesawrapper}>
      <Image
        alt="icon_abertura"
        style={s.imageIconInfoMesaItem3}
        source={require('../assets/Images/icon_abertura.png')}
      />
    </View>
    <Text style={s.textItemMesaInfo}> Abertura: </Text>
    <Text style={s.textValorItemMesaInfo}> {abertura} </Text>
  </View>
));

const Utilizacao = React.memo(({ utilizacao }: { utilizacao?: string }) => (
  <View style={s.ViewMesaInfoItem}>
    <View style={s.imageiconiteminfomesawrapper}>
      <Image
        alt="icon_utilizacao"
        style={s.imageIconInfoMesaItem4}
        source={require('../assets/Images/icon_utilizacao.png')}
      />
    </View>
    <Text style={s.textItemMesaInfo}> Utilização: </Text>
    <Text style={s.textValorItemMesaInfo}> {utilizacao} </Text>
  </View>
));

const Taxa = React.memo(({ taxa }: { taxa?: number }) => {
  const [taxaVisivel, settaxaVisivel] = useState(false);

  return (
    <View style={s.ViewMesaInfoItem}>
      <View style={s.imageiconiteminfomesawrapper}>
        <Image
          alt="icon_taxa"
          style={s.imageIconInfoMesaItem5}
          source={require('../assets/Images/icon_taxa.png')}
        />
      </View>
      <Text style={s.textItemMesaInfo}> Taxa: </Text>

      {taxaVisivel && (
        <Text style={s.textValorItemMesaInfo}>
          R$ {taxa ? taxa.toFixed(2).replace('.', ',') : '0,00'}
        </Text>
      )}
      <View style={s.EyeAnimationTaxa}>
        <EyeAnimation
          onPress={() => settaxaVisivel(!taxaVisivel)}
          visible={taxaVisivel}
        />
      </View>
    </View>
  );
});

const Consumacao = React.memo(
  ({ consumacao }: { consumacao?: number }) => (
    <View style={s.ViewMesaInfoItem}>
      <View style={s.imageiconiteminfomesawrapper}>
        <Image
          alt="icon_consumacao"
          style={s.imageIconInfoMesaItem6}
          source={require('../assets/Images/icon_consumacao.png')}
        />
      </View>
      <Text style={s.textItemMesaInfo}> Consumação: </Text>
      <Text style={s.textValorItemMesaInfo}>
        R$ {consumacao ? consumacao.toFixed(2).replace('.', ',') : '0,00'}
      </Text>
    </View>
  )
);

const TotalMesa = React.memo(({ total }: { total?: number }) => (
  <View style={s.ViewTotalMesa}>
    <Image
      alt="icon_totalmesa"
      style={s.imageTotalMesa}
      source={require('../assets/Images/icon_totalmesa.png')}
    />
    <Text style={s.textTotal}>Total:</Text>
    <Text style={s.TotalMesaNumber}>
      R$ {total ? total.toFixed(2).replace('.', ',') : '0,00'}
    </Text>
  </View>
));

// --- exporta o objeto principal memoizado ---
export const CardMesaInfo = {
  Cliente,
  Garcom,
  Taxa,
  Abertura,
  Utilizacao,
  Consumacao,
  TotalMesa,
};


const s = StyleSheet.create({
  ViewMesaInfoItem: {
    flexDirection: 'row',
    paddingBottom: 1,
    height: 30,
    marginTop: 1,
    paddingLeft: 3,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  imageIconInfoMesaItem1: {
    width: 20,
    height: 20,
  },
  imageIconInfoMesaItem2: {
    width: 21,
    height: 25,
  },
  imageIconInfoMesaItem3: {
    width: 20,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem4: {
    width: 20,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem5: {
    width: 17,
    height: 20,
    marginTop: 3,
  },
  imageIconInfoMesaItem6: {
    width: 20,
    height: 24,
    marginTop: 3,
  },
  imageiconiteminfomesawrapper: {
    width: 24,
  },
  textItemMesaInfo: {
    color: '#2A64D0',
    width: 100,
    alignSelf: "center"
  },
  textValorItemMesaInfo: {
    color: '#74747B',
    alignSelf: "center"
  },
  EyeAnimationTaxa: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  ViewTotalMesa: {
    backgroundColor: '#7392CD',
    width: '100%',
    height: 45,
    borderRadius: 10,
    
    
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  imageTotalMesa: {
    width: 25,
    height: 25,
  },
  textTotal: {
    marginLeft: 1,
    fontWeight: 'bold',
    color: 'white',
  },
  TotalMesaNumber: {
    marginRight: 5,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 3,
    color: "white"

     
  }
});
