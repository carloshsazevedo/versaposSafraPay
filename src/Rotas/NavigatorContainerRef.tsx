// NavigatorContainerRef.tsx
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import * as React from 'react';

// Cria referência manual
export const navigationRef = React.createRef<NavigationContainerRef>();

export function reset(name: string, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
}
