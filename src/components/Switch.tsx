import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  AccessibilityProps,
} from 'react-native';

/**
 * SwitchCustom.tsx
 * -----------------
 * Componente de switch estilizado e completo para React Native.
 * - Suporta controle (controlled) e não-controlado (uncontrolled)
 * - Animação suave
 * - Prop `size` para alterar dimensões (small | medium | large)
 * - `onColor` e `offColor` customizáveis
 * - `disabled`, `label`, `style` e acessibilidade
 *
 * Como usar:
 * import SwitchCustom from './SwitchCustom';
 * <SwitchCustom
 *   value={value}
 *   onChange={val => setValue(val)}
 *   label="Pagamento NFC"
 * />
 */

type Size = 'small';

interface Props extends AccessibilityProps {
  value?: boolean; // se informado, component fica controlado
  defaultValue?: boolean; // valor inicial se uncontrolled
  onChange?: (val: boolean) => void;
  disabled?: boolean;
  label?: string | React.ReactNode;
  onColor?: string; // cor do fundo quando ON
  offColor?: string; // cor do fundo quando OFF
  thumbColor?: string; // cor do pino
  size?: Size;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

const SIZE_MAP = {
  small: { width: 44, height: 22, thumb: 18, padding: 3 },
};

export default function SwitchCustom({
  value,
  defaultValue = false,
  onChange,
  disabled = false,
  label,
  onColor = '#3562BC',
  offColor = '#a7aaafff',
  thumbColor = '#ffffff',
  size = 'small',
  style,
  labelStyle,
  accessibilityLabel,
  ...accessibilityProps
}: Props) {
  const isControlled = typeof value === 'boolean';
  const [internalValue, setInternalValue] = useState<boolean>(
    isControlled ? (value as boolean) : defaultValue
  );

  // Animated value: 0 = off, 1 = on
  const anim = useRef(new Animated.Value(internalValue ? 1 : 0)).current;

  // update internal state when controlled
  useEffect(() => {
    if (isControlled) {
      animateTo(value as boolean);
      setInternalValue(value as boolean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function animateTo(target: boolean) {
    Animated.timing(anim, {
      toValue: target ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // animating layout properties
    }).start();
  }

  function toggle() {
    if (disabled) return;
    const next = !(isControlled ? (value as boolean) : internalValue);
    if (!isControlled) setInternalValue(next);
    animateTo(next);
    onChange && onChange(next);
  }

  const metrics = SIZE_MAP[size];
  const trackWidth = metrics.width;
  const trackHeight = metrics.height;
  const thumbSize = metrics.thumb;
  const padding = metrics.padding;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [padding, trackWidth - thumbSize - padding],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [offColor, onColor],
  });

  const opacity = disabled ? 0.45 : 1;

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: isControlled ? (value as boolean) : internalValue, disabled }}
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : 'switch')}
      disabled={disabled}
      {...accessibilityProps}
      style={[styles.container, style]}
    >
      {label ? (
        typeof label === 'string' ? (
          <Text style={[styles.label, labelStyle]} numberOfLines={1}>
            {label}
          </Text>
        ) : (
          <View style={{ marginRight: 8 }}>{label}</View>
        )
      ) : null}

      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor,
            opacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              transform: [{ translateX }],
              backgroundColor: thumbColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            } as ViewStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginRight: 10,
    fontSize: 15,
    color: '#0b213d',
  },
  track: {
    justifyContent: 'center',
    
  },
  thumb: {
    position: 'absolute',
    top: 0,
    margin: 1
    // left is animated via translateX
  },
});
