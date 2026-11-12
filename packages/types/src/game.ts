import type { ChamberType, CharacterType, DeclaredCards } from "./constants.ts";
import type { Lobby } from "./lobby.ts";
import type { BasePlayer } from "./player.ts";

export const gamePhase = ["Declarations", "Revealing", "Finished"] as const;
export type GamePhase = (typeof gamePhase)[number];

export interface CardDeclaration {
  player: BasePlayer;
  declared: boolean;
  declaredCards: DeclaredCards | null;
}

export interface Settings {
  characterCards: Record<CharacterType, number>;
  chamberCards: Record<ChamberType, number>;
  turns: number;
}

export interface GameState extends Lobby {
  gamePhase: GamePhase;
  round: number;
  foundTreasures: number;
  foundTraps: number;
  foundEmpty: number;
  currentKeyHolderId: string;
}
