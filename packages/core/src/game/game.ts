import { shuffle } from "utils";
import { DEFAULT_SETTINGS, MAX_PLAYERS, MAX_ROUNDS, MIN_PLAYERS } from "./constants.ts";
import {
  chamberType,
  type BasePlayer,
  type ChamberType,
  type CharacterType,
  type DeclaredCards,
  type GameAction,
  type GamePhase,
  type Settings,
} from "types";
import { Player } from "./player.ts";

export class Game {
  players: Player[] = [];
  private readonly revealedCards: ChamberType[] = [];
  private readonly initialHandSize: number = 0;
  round: number = 0;
  turn: number = 0;
  settings: Settings;
  currentKeyHolderId: string;
  gamePhase: GamePhase = "Declarations";
  constructor(players: BasePlayer[]) {
    if (players.length > MAX_PLAYERS)
      throw new Error(`Too many players, maximum allowed size is ${MAX_PLAYERS}`);
    if (players.length < MIN_PLAYERS)
      throw new Error(`Too little players, minimum allowed size is ${MIN_PLAYERS}`);
    this.settings = DEFAULT_SETTINGS[players.length];
    this.initialHandSize = this.buildDeck().length / players.length;
    this.preparePlayers(players);
    this.currentKeyHolderId = this.drawFirstKeyHolder();
    this.startRound();
  }

  get handSize() {
    return this.initialHandSize - (this.round - 1);
  }
  get allPlayersDeclared() {
    return this.players.every((p) => !!p.declaredCards);
  }

  get roundOver() {
    return this.turn >= this.players.length;
  }

  get isLastRound() {
    return this.round >= MAX_ROUNDS;
  }
  get winningTeam(): CharacterType | null {
    if (this.foundCardsOfType("Treasure") === this.settings.chamberCards.Treasure)
      return "Adventurer";
    if (this.foundCardsOfType("Trap") === this.settings.chamberCards.Trap) return "Guardian";
    if (this.isLastRound && this.roundOver) return "Guardian";
    return null;
  }

  get winners(): Player[] {
    const team = this.winningTeam;
    return team ? this.players.filter((p) => p.role === team) : [];
  }
  foundCardsOfType(type: ChamberType) {
    return this.revealedCards.filter((c) => c === type).length;
  }

  preparePlayers(players: BasePlayer[]) {
    const characterCards = this.prepareCharacterCards(players.length);
    this.players = players.map((p, i) => new Player(p.id, p.name, characterCards[i]));
  }
  drawFirstKeyHolder() {
    const randomIndex = Math.floor(Math.random() * this.players.length);
    this.currentKeyHolderId = this.players[randomIndex].id;
    return this.currentKeyHolderId;
  }
  prepareCharacterCards(playerCount: number) {
    const characterCards: CharacterType[] = [];
    for (let i = 0; i < this.settings.characterCards["Guardian"]; i++) {
      characterCards.push("Guardian");
    }
    for (let i = 0; i < this.settings.characterCards["Adventurer"]; i++) {
      characterCards.push("Adventurer");
    }
    const shuffledCharacterCards = shuffle(characterCards);
    const slicedCharactersCards = shuffledCharacterCards.slice(0, playerCount);

    return slicedCharactersCards;
  }
  buildDeck() {
    return chamberType.flatMap((type) =>
      Array.from({ length: this.settings.chamberCards[type] }, () => type),
    );
  }
  private collectPool(): ChamberType[] {
    return this.round === 1 ? this.buildDeck() : this.players.flatMap((p) => p.hiddenCards);
  }
  startRound() {
    this.round++;
    this.turn = 0;
    const pool = shuffle(this.collectPool());
    const handSize = this.handSize;
    if (pool.length !== handSize * this.players.length) throw new Error("Pool size mismatch");
    for (const player of this.players) player.dealHand(pool.splice(0, handSize));
    this.gamePhase = "Declarations";
  }
  revealCard(actorId: string, targetPlayerId: string, cardIndex: number) {
    if (this.gamePhase !== "Revealing")
      throw new Error("Can't reveal cards if gamePhase is not 'Revealing'");
    const keyHolderPlayer = this.players.find((p) => p.id === this.currentKeyHolderId);
    if (!keyHolderPlayer) throw new Error("No KeyHolder Player in a game");
    if (actorId !== keyHolderPlayer.id) throw new Error("Only KeyHolder player can reveal cards");
    const targetPlayer = this.players.find((p) => p.id === targetPlayerId);
    if (keyHolderPlayer === targetPlayer)
      throw new Error("You can't target yourself for card reveal");
    if (!targetPlayer) throw new Error("Targeted player is not part of the game");
    const card = targetPlayer.revealCard(cardIndex);
    this.revealedCards.push(card);
    this.currentKeyHolderId = targetPlayerId;
    this.turn++;
  }

  declareCards(actorId: string, declaredCards: DeclaredCards) {
    if (this.gamePhase !== "Declarations")
      throw new Error("Can't declare cards if gamePhase is not 'Declarations'");
    const player = this.players.find((p) => p.id === actorId);
    if (!player) throw new Error("Player not found in the game");
    if (player.declaredCards) throw new Error("Player already declared cards");
    const counts = chamberType.map((t) => declaredCards[t]);
    if (!counts.every((c) => Number.isInteger(c) && c >= 0))
      throw new Error("Cannot declare negative number");
    if (counts.reduce((a, b) => a + b, 0) !== player.hiddenCount)
      throw new Error("Declared cards must add up to the number of cards in hand");

    player.declareCards(declaredCards);
  }

  private advance() {
    switch (this.gamePhase) {
      case "Declarations":
        if (this.allPlayersDeclared) {
          this.players.forEach((p) => p.shuffleHand());
          this.gamePhase = "Revealing";
        }
        break;
      case "Revealing":
        if (this.winningTeam) this.gamePhase = "Finished";
        else if (this.roundOver) this.startRound();
        break;
    }
  }

  handleAction(action: GameAction) {
    if (this.gamePhase === "Finished") throw new Error("Game already ended");
    switch (action.type) {
      case "card.reveal":
        this.revealCard(action.actorId, action.ctx.targetPlayerId, action.ctx.cardIndex);
        break;
      case "card.declare":
        this.declareCards(action.actorId, action.ctx.declaredCards);
        break;
      default:
        throw new Error("Unsupported action");
    }
    this.advance();
  }
}
