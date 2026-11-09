export const easeOut = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.2,
  base: 0.28,
  slow: 0.35,
} as const;

export const stagger = 0.05;

export const spring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const pressSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 30,
  mass: 0.7,
};
