import type { CardInHand, ChamberType, CharacterType, DeclaredCards } from "types";
import { shuffle } from "utils";

export class Player {
  cardsInHand: CardInHand[] = [];
  declaredCards: DeclaredCards | null = null;
  isConnected: boolean = true;
  constructor(
    readonly id: string,
    public name: string,
    readonly role: CharacterType,
  ) {}

  get hand(): ChamberType[] {
    return this.cardsInHand.map((c) => c.card);
  }

  get hiddenCount() {
    return this.cardsInHand.filter((c) => !c.revealed).length;
  }
  get hiddenCards() {
    return this.cardsInHand.filter((c) => !c.revealed).map((c) => c.card);
  }
  countOf(chamberType: ChamberType) {
    return this.cardsInHand.filter((c) => c.card === chamberType).length;
  }
  dealHand(cards: ChamberType[]) {
    this.cardsInHand = cards.map((card) => ({ card, revealed: false }));
    this.declaredCards = null;
  }
  shuffleHand() {
    this.cardsInHand = shuffle(this.cardsInHand);
  }
  declareCards(cards: DeclaredCards) {
    this.declaredCards = cards;
  }
  revealCard(index: number) {
    const card = this.cardsInHand[index];
    if (!card || card.revealed) throw new Error("Invalid move");
    card.revealed = true;
    return card.card;
  }
}
