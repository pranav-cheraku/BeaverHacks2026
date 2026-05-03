import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  DISPLAY_LG: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
  HEADLINE_H1: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  HEADLINE_H2: {
    fontFamily: 'Fraunces_800ExtraBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.55,
  },
  BODY_READING: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  UI_LABEL: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  UI_BUTTON: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1.54,
  },
  EYEBROW: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  METADATA: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    lineHeight: 16,
  },
};
