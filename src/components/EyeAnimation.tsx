import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

// Criar componentes animados
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface EyeAnimationProps {
  visible: boolean;
  onPress: () => void;
}

const EyeAnimation = ({ visible, onPress }: EyeAnimationProps) => {
  const eyeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Atualiza a animação quando a prop 'visible' muda
    Animated.timing(eyeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handlePress = () => {
    // Animação de piscar rápido
    Animated.sequence([
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(blinkAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  // Interpolações para as animações
  const eyelidTop = eyeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['M5,10 Q15,20 25,10', 'M5,5 Q15,0 25,5'],
  });

  const eyelidBottom = eyeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['M5,20 Q15,10 25,20', 'M5,25 Q15,30 25,25'],
  });

  const irisScale = eyeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const irisOpacity = eyeAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  });

  return (
    <TouchableOpacity 
    
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Svg width={36} height={30} viewBox="0 0 30 30">
        {/* Parte branca do olho */}
        <Circle cx="15" cy="15" r="10" fill="#f0f0f0" stroke="#ddd" strokeWidth={0.8} />
        
        {/* Íris animada */}
        <AnimatedG
          opacity={irisOpacity}
          transform={[{ scale: irisScale }]}
          originX="15"
          originY="15"
        >
          <Circle cx="15" cy="15" r="5" fill="#4a6da7" />
          <Circle cx="15" cy="13" r="1.5" fill="#2c4365" opacity={0.8} />
          <Circle cx="16" cy="14" r="0.5" fill="#fff" opacity={0.9} />
        </AnimatedG>
        
        {/* Pálpebra superior */}
        <AnimatedPath
          d={eyelidTop}
          fill="#f8f8f8"
          stroke="#ccc"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
        
        {/* Pálpebra inferior */}
        <AnimatedPath
          d={eyelidBottom}
          fill="#f8f8f8"
          stroke="#ccc"
          strokeWidth={0.8}
          strokeLinecap="round"
        />
        
        {/* Efeito de piscar */}
        <AnimatedPath
          d="M5,5 Q15,0 25,5 L25,25 Q15,30 5,25 Z"
          fill="#f8f8f8"
          opacity={blinkAnim}
        />
      </Svg>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default EyeAnimation;