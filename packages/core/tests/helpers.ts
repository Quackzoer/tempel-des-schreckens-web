import { chamberType, type BasePlayer, type ChamberType, type DeclaredCards } from "types";
import { Game } from "../src/game/game.ts";
import type { Player } from "../src/game/player.ts";

export const makePlayers = (n: number): BasePlayer[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `Player ${i + 1}` }));

export const newGame = (n = 5) => new Game(makePlayers(n));

export const rigHands = (game: Game, type: ChamberType) => {
  for (const p of game.players) {
    p.cardsInHand = Array.from({ length: game.handSize }, () => ({ card: type, revealed: false }));
  }
};

export const honestDeclaration = (p: Player): DeclaredCards => ({
  Treasure: p.countOf("Treasure"),
  Trap: p.countOf("Trap"),
  Empty: p.countOf("Empty"),
});

export const declare = (game: Game, playerId: string, declaredCards: DeclaredCards) =>
  game.handleAction({ type: "card.declare", actorId: playerId, ctx: { declaredCards } });

export const declareAll = (game: Game) => {
  for (const p of game.players) declare(game, p.id, honestDeclaration(p));
};

export const startRevealing = (n = 5, rigged?: ChamberType) => {
  const game = newGame(n);
  if (rigged) rigHands(game, rigged);
  declareAll(game);
  return game;
};

export const reveal = (
  game: Game,
  targetPlayerId: string,
  cardIndex: number,
  actorId = game.currentKeyHolderId,
) => game.handleAction({ type: "card.reveal", actorId, ctx: { targetPlayerId, cardIndex } });

export const otherThanKeyHolder = (game: Game) =>
  game.players.find((p) => p.id !== game.currentKeyHolderId)!;

/** Odkrywa pierwszą pasującą kartę innego gracza, według kolejności preferencji typów. */
export const revealOne = (game: Game, prefer: ChamberType[] = [...chamberType]) => {
  const targets = game.players.filter((p) => p.id !== game.currentKeyHolderId);
  for (const type of prefer) {
    for (const target of targets) {
      const index = target.cardsInHand.findIndex((c) => !c.revealed && c.card === type);
      if (index !== -1) {
        reveal(game, target.id, index);
        return { type, targetId: target.id };
      }
    }
  }
  throw new Error("No card to reveal");
};

export const revealRound = (game: Game, prefer?: ChamberType[]) => {
  const round = game.round;
  while (game.gamePhase === "Revealing" && game.round === round) revealOne(game, prefer);
};

export const playToTheEnd = (game: Game, prefer?: ChamberType[]) => {
  while (game.gamePhase !== "Finished") {
    if (game.gamePhase === "Declarations") declareAll(game);
    revealRound(game, prefer);
  }
};

export const totals = (game: Game) =>
  Object.fromEntries(
    chamberType.map((t) => [
      t,
      game.players.flatMap((p) => p.hiddenCards).filter((c) => c === t).length +
        game.foundCardsOfType(t),
    ]),
  ) as Record<ChamberType, number>;
