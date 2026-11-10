import type { ChamberType, CharacterType, DeclaredCards } from "./constants.ts";

export interface BasePlayer {
  // TODO Generate UUID for player when opening the website
  id: string;
  name: string;
}

export interface InGamePlayer extends BasePlayer {
  characterType: CharacterType;
  cardsInHand: ChamberType[];
  declaredCards?: DeclaredCards;
  isKeyHolder: boolean;
  isConnected: boolean;
}
