import { describe, expect, test } from "vite-plus/test";
import { DEFAULT_SETTINGS } from "../src/game/constants.ts";

import {
  declare,
  declareAll,
  honestDeclaration,
  newGame,
  otherThanKeyHolder,
  playToTheEnd,
  reveal,
  revealOne,
  revealRound,
  rigHands,
  startRevealing,
  totals,
} from "./helpers.ts";

describe("setup", () => {
  test.each([2, 11])("rejects %i players", (n) => {
    expect(() => newGame(n)).toThrow();
  });

  test.each([3, 5, 10])("deals 5 cards to each of %i players", (n) => {
    const game = newGame(n);
    expect(game.round).toBe(1);
    expect(game.gamePhase).toBe("Declarations");
    for (const p of game.players) expect(p.cardsInHand).toHaveLength(5);
  });

  test.each([3, 5, 10])("uses the whole deck for %i players", (n) => {
    expect(totals(newGame(n))).toEqual(DEFAULT_SETTINGS[n].chamberCards);
  });
});

describe("declarations", () => {
  test("reveal is not allowed before everybody declared", () => {
    const game = newGame();
    expect(() => reveal(game, otherThanKeyHolder(game).id, 0)).toThrow();
  });

  test("moves to Revealing only after the last declaration", () => {
    const game = newGame();
    const players = [...game.players];
    const last = players.pop()!;
    for (const p of players) {
      declare(game, p.id, honestDeclaration(p));
      expect(game.gamePhase).toBe("Declarations");
    }
    declare(game, last.id, honestDeclaration(last));
    expect(game.gamePhase).toBe("Revealing");
  });

  test.each([
    ["too many cards", { Treasure: 6, Trap: 0, Empty: 0 }],
    ["too few cards", { Treasure: 1, Trap: 0, Empty: 0 }],
    ["negative number", { Treasure: -1, Trap: 0, Empty: 6 }],
    ["fraction", { Treasure: 0.5, Trap: 0.5, Empty: 4 }],
  ])("rejects declaration: %s", (_, declaredCards) => {
    const game = newGame();
    expect(() => declare(game, game.players[0].id, declaredCards)).toThrow();
  });

  test("rejects a second declaration from the same player", () => {
    const game = newGame();
    const p = game.players[0];
    declare(game, p.id, honestDeclaration(p));
    expect(() => declare(game, p.id, honestDeclaration(p))).toThrow();
  });
});

describe("revealing", () => {
  test("only the key holder can reveal", () => {
    const game = startRevealing();
    const notHolder = otherThanKeyHolder(game);
    const target = game.players.find((p) => p.id !== notHolder.id)!;
    expect(() => reveal(game, target.id, 0, notHolder.id)).toThrow();
  });

  test("key holder can't target themselves", () => {
    const game = startRevealing();
    expect(() => reveal(game, game.currentKeyHolderId, 0)).toThrow();
  });

  test("rejects an index outside the hand", () => {
    const game = startRevealing();
    expect(() => reveal(game, otherThanKeyHolder(game).id, 99)).toThrow();
  });

  test("passes the key to the owner of the revealed card and counts the turn", () => {
    const game = startRevealing();
    const target = otherThanKeyHolder(game);
    reveal(game, target.id, 0);
    expect(game.currentKeyHolderId).toBe(target.id);
    expect(game.turn).toBe(1);
    expect(target.cardsInHand[0].revealed).toBe(true);
  });

  test("a card can't be revealed twice and a failed reveal changes nothing", () => {
    const game = startRevealing();
    const k = game.currentKeyHolderId;
    const t = otherThanKeyHolder(game).id;
    reveal(game, t, 0); // k -> t
    reveal(game, k, 0); // t -> k
    expect(() => reveal(game, t, 0)).toThrow();
    expect(game.currentKeyHolderId).toBe(k);
    expect(game.turn).toBe(2);
  });
});

describe("rounds", () => {
  test.each([3, 5, 10])("round 2 starts after %i reveals, key holder stays", (n) => {
    const game = startRevealing(n, "Empty");
    let last!: ReturnType<typeof revealOne>;
    for (let i = 0; i < n; i++) last = revealOne(game, ["Empty"]);

    expect(game.round).toBe(2);
    expect(game.gamePhase).toBe("Declarations");
    expect(game.turn).toBe(0);
    expect(game.currentKeyHolderId).toBe(last.targetId);
    for (const p of game.players) {
      expect(p.cardsInHand).toHaveLength(4);
      expect(p.declaredCards).toBeNull();
    }
  });

  test("hands shrink 5, 4, 3, 2 across the game", () => {
    const game = newGame(4);
    rigHands(game, "Empty");
    const sizes: number[] = [];
    while (game.gamePhase !== "Finished") {
      sizes.push(game.players[0].cardsInHand.length);
      declareAll(game);
      revealRound(game);
    }
    expect(sizes).toEqual([5, 4, 3, 2]);
  });

  test.each([3, 5, 10])("never loses or duplicates cards (%i players)", (n) => {
    const game = startRevealing(n);
    const expected = DEFAULT_SETTINGS[n].chamberCards;
    while (game.gamePhase !== "Finished") {
      revealRound(game, ["Empty", "Treasure", "Trap"]);
      expect(totals(game)).toEqual(expected);
      if (game.gamePhase === "Declarations") declareAll(game);
    }
  });
});

describe("win conditions", () => {
  test.each([3, 5, 10])("Adventurers win when all treasure is found (%i players)", (n) => {
    const game = newGame(n);
    rigHands(game, "Treasure");
    playToTheEnd(game, ["Treasure"]);
    expect(game.gamePhase).toBe("Finished");
    expect(game.winningTeam).toBe("Adventurer");
    expect(game.foundCardsOfType("Treasure")).toBe(DEFAULT_SETTINGS[n].chamberCards.Treasure);
    expect(game.winners.every((p) => p.role === "Adventurer")).toBe(true);
  });

  test("Guardians win when all traps are found", () => {
    const game = newGame(3);
    rigHands(game, "Trap");
    playToTheEnd(game);
    expect(game.winningTeam).toBe("Guardian");
    expect(game.round).toBe(1);
    expect(game.foundCardsOfType("Trap")).toBe(DEFAULT_SETTINGS[3].chamberCards.Trap);
  });

  test("Guardians win when four rounds pass without all the gold", () => {
    const game = newGame(3);
    rigHands(game, "Empty");
    playToTheEnd(game);
    expect(game.round).toBe(4);
    expect(game.winningTeam).toBe("Guardian");
    expect(game.gamePhase).toBe("Finished");
  });

  test("rejects actions after the game ended", () => {
    const game = newGame(3);
    rigHands(game, "Trap");
    playToTheEnd(game);
    expect(() => reveal(game, otherThanKeyHolder(game).id, 0)).toThrow();
  });
});
