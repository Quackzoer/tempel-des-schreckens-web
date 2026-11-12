import type { DeclaredCards } from "./constants.ts";

export type GameActionType = GameAction["type"];

export type GameAction = {
  actorId: string;
} & (
  | {
      type: "card.declare";
      ctx: {
        declaredCards: DeclaredCards;
      };
    }
  | {
      type: "card.reveal";
      ctx: {
        targetPlayerId: string;
        cardIndex: number;
      };
    }
);
