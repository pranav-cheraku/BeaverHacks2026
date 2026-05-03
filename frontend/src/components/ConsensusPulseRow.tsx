import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import ProgressBar from './ProgressBar';

interface Props {
  label: string;
  percent: number;
  status: string;
}

export default function ConsensusPulseRow({ label, percent, status }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="pulse" size={14} color={Colors.RISO} />
        <Text style={styles.pulseLabel}>{label}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <ProgressBar percent={percent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: Colors.INK_3,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  status: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: Colors.INK_4,
    marginRight: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  percent: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 12,
    color: Colors.RISO,
  },
});
