import { Colors } from './colors';

// Shared header bar used across all screens
export const SharedHeader = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  height: 56,
  paddingHorizontal: 20,
  backgroundColor: Colors.PAPER,
  borderBottomWidth: 1.5,
  borderBottomColor: Colors.INK,
};

// Wordmark "GroundTruth" text style
export const SharedWordmark = {
  fontFamily: 'Fraunces_800ExtraBold',
  fontSize: 20,
  color: Colors.INK,
  letterSpacing: -0.5,
};

// Card base — sharp corners, hard shadow, ink border
export const SharedCard = {
  backgroundColor: Colors.CARD,
  borderRadius: 0,
  borderWidth: 1.5,
  borderColor: Colors.INK,
  padding: 20,
  shadowColor: Colors.INK,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};

// Button (ink-filled)
export const SharedButton = {
  backgroundColor: Colors.INK,
  borderRadius: 0,
  borderWidth: 1.5,
  borderColor: Colors.INK,
  paddingVertical: 14,
  paddingHorizontal: 18,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  flexDirection: 'row' as const,
};

export const SharedButtonText = {
  fontFamily: 'JetBrainsMono_700Bold',
  fontSize: 11,
  color: Colors.PAPER,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.54,
};

// Orange (riso) button variant
export const SharedButtonOrange = {
  ...SharedButton,
  backgroundColor: Colors.RISO,
  borderColor: Colors.INK,
};

export const SharedButtonOrangeText = {
  ...SharedButtonText,
  color: Colors.INK,
};

// Ghost button
export const SharedButtonGhost = {
  ...SharedButton,
  backgroundColor: Colors.PAPER,
};

export const SharedButtonGhostText = {
  ...SharedButtonText,
  color: Colors.INK,
};

// Eyebrow label
export const SharedEyebrow = {
  fontFamily: 'JetBrainsMono_400Regular',
  fontSize: 10,
  color: Colors.INK_2,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.6,
};

// Pill/tag
export const SharedPill = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 0,
  borderWidth: 1.5,
  borderColor: Colors.INK,
  alignSelf: 'flex-start' as const,
};

export const SharedPillText = {
  fontFamily: 'JetBrainsMono_400Regular',
  fontSize: 10,
  color: Colors.INK,
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2,
};
