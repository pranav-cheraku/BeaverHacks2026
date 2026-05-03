import React from 'react';
import { View } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  color?: string;
  columns?: number;
  rows?: number;
  dotSize?: number;
  gap?: number;
  opacity?: number;
}

export default function HalftoneDecoration({
  color = Colors.INK,
  columns = 5,
  rows = 3,
  dotSize = 3,
  gap = 6,
  opacity = 0.15,
}: Props) {
  const dots = Array.from({ length: columns * rows });
  const width = columns * dotSize + (columns - 1) * gap;

  return (
    <View
      pointerEvents="none"
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        width,
        gap,
        opacity,
      }}
    >
      {dots.map((_, i) => (
        <View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}
