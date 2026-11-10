export const characterType = ["Guardian", "Adventurer"] as const;
export type CharacterType = (typeof characterType)[number];

export const chamberType = ["Treasure", "Trap", "Empty"] as const;
export type ChamberType = (typeof chamberType)[number];

export type DeclaredCards = Record<ChamberType, number>;
