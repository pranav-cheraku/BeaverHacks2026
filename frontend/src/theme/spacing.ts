export const Spacing = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 40,
} as const;

export const Radius = {
  DEFAULT: 0,
  SM: 0,
  LG: 0,
  PILL: 0,
} as const;

export const HardShadow = {
  shadowColor: '#111111',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
} as const;

export const HardShadowSm = {
  shadowColor: '#111111',
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
} as const;
