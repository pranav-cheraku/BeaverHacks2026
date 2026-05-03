import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  style?: ViewStyle;
  shadowOffset?: { width: number; height: number };
  children: React.ReactNode;
}

export default function HardShadowCard({ style, shadowOffset = { width: 4, height: 4 }, children }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      {Platform.OS === 'android' && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: Colors.INK,
              top: shadowOffset.height,
              left: shadowOffset.width,
            },
          ]}
          pointerEvents="none"
        />
      )}
      <View
        style={[
          styles.card,
          Platform.OS === 'ios' && {
            shadowColor: Colors.INK,
            shadowOffset,
            shadowOpacity: 1,
            shadowRadius: 0,
          },
          Platform.OS === 'android' && { elevation: 0 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  card: {
    backgroundColor: Colors.CARD,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    padding: 20,
  },
});
