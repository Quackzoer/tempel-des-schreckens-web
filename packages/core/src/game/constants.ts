import type { Settings } from "types";

export const DEFAULT_SETTINGS: Record<number, Settings> = {
  3: {
    characterCards: {
      Adventurer: 2,
      Guardian: 2,
    },
    chamberCards: {
      Empty: 8,
      Trap: 2,
      Treasure: 5,
    },
    turns: 3,
  },
  4: {
    characterCards: {
      Adventurer: 3,
      Guardian: 2,
    },
    chamberCards: {
      Empty: 12,
      Trap: 2,
      Treasure: 6,
    },
    turns: 4,
  },
  5: {
    characterCards: {
      Adventurer: 3,
      Guardian: 2,
    },
    chamberCards: {
      Empty: 16,
      Trap: 2,
      Treasure: 7,
    },
    turns: 5,
  },
  6: {
    characterCards: {
      Adventurer: 4,
      Guardian: 2,
    },
    chamberCards: {
      Empty: 20,
      Trap: 2,
      Treasure: 8,
    },
    turns: 6,
  },
  7: {
    characterCards: {
      Adventurer: 5,
      Guardian: 3,
    },
    chamberCards: {
      Empty: 26,
      Trap: 2,
      Treasure: 7,
    },
    turns: 7,
  },
  8: {
    characterCards: {
      Adventurer: 6,
      Guardian: 3,
    },
    chamberCards: {
      Empty: 30,
      Trap: 2,
      Treasure: 8,
    },
    turns: 8,
  },
  9: {
    characterCards: {
      Adventurer: 6,
      Guardian: 3,
    },
    chamberCards: {
      Empty: 34,
      Trap: 2,
      Treasure: 9,
    },
    turns: 9,
  },
  10: {
    characterCards: {
      Adventurer: 7,
      Guardian: 4,
    },
    chamberCards: {
      Empty: 37,
      Trap: 3,
      Treasure: 10,
    },
    turns: 10,
  },
} as const;

export const MAX_ROUNDS = 4;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 10;
