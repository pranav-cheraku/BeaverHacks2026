import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  percent: number;
}

export default function ProgressBar({ percent }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { flex: clamped }]} />
      <View style={{ flex: 100 - clamped }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    flexDirection: 'row',
    backgroundColor: Colors.PAPER_3,
    borderWidth: 1,
    borderColor: Colors.INK,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.INK,
  },
});
