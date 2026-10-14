export interface CardInstance {
  instanceId: string;
  cardId: string;
}

interface DeckState {
  drawPile: CardInstance[];
  discardPile: CardInstance[];
}

export interface PlayerCardsState {
  villainDeck: DeckState;
  fateDeck: DeckState;
  hand: CardInstance[];
}