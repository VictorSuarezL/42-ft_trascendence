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

export interface GamePlayerState {
  userId: number;
  villainId: string;
  cards: PlayerCardsState;
}

export interface GameState {
  id: string;
  players: GamePlayerState[];
  currentPlayerId: number;
  status: 'IN_PROGRESS' | 'FINISHED';
}