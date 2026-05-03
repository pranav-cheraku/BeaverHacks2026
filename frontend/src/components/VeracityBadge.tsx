import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
  label: string;
}

export default function VeracityBadge({ label }: Props) {
  return (
    <View style={styles.badge}>
      <MaterialCommunityIcons
        name="check-decagram"
        size={14}
        color={Colors.RISO}
        style={{ marginRight: 4 }}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.RISO_SOFT,
    borderWidth: 1.5,
    borderColor: Colors.INK,
    borderRadius: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.INK_2,
  },
});
