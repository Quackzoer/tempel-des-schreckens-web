import { shuffle } from "../utils/shuffle-array.ts";
import { DEFAULT_SETTINGS } from "./constants.ts";
import type { BasePlayer, ChamberType, CharacterType, InGamePlayer, Settings } from "types";

export class Game {
  players: InGamePlayer[] = [];
  foundTreasures: number = 0;
  foundTraps: number = 0;
  foundEmpty: number = 0;
  deck: ChamberType[] = [];
  round: number = 0;
  turn: number = 0;
  settings: Settings;
  currentKeyHolderId: string;
  constructor(players: BasePlayer[]) {
    this.settings = DEFAULT_SETTINGS[players.length];
    this.initializeDeck();
    this.players = this.preparePlayers(players);
    this.currentKeyHolderId = this.drawFirstKeyHolder();
  }

  preparePlayers(players: BasePlayer[]): InGamePlayer[] {
    const characterCards = this.prepareCharacterCards(players.length);
    const cardsInHand = this.cardsInHand();
    return players.map((p, i) => ({
      ...p,
      characterType: characterCards[i],
      isKeyHolder: false,
      cardsInHand: Array.from({ length: cardsInHand }).map(() => this.deck.pop()!),
      isConnected: true,
    }));
  }
  drawFirstKeyHolder() {
    const randomIndex = Math.floor(Math.random() * this.players.length);
    const keyHolder = this.players[randomIndex];
    this.players[randomIndex].isKeyHolder = true;
    this.currentKeyHolderId = keyHolder.id;
    return keyHolder.id;
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
  initializeDeck() {
    for (let i = 0; i < this.settings.chamberCards["Empty"]; i++) {
      this.deck.push("Empty");
    }
    for (let i = 0; i < this.settings.chamberCards["Trap"]; i++) {
      this.deck.push("Trap");
    }
    for (let i = 0; i < this.settings.chamberCards["Treasure"]; i++) {
      this.deck.push("Treasure");
    }
    this.deck = shuffle(this.deck);
  }
  cardsInHand() {
    return this.players.length - this.round + 1;
  }
}
