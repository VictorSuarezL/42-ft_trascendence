import { DeckPrismaModel } from '../models/prisma/deck.prisma.model';
import type { CardInstance, PlayerCardsState } from '../types/game.types';
import { randomInt } from 'node:crypto';

function createCardInstances(
  cards: { id: string; quantity: number }[],
): CardInstance[] {
  const instances: CardInstance[] = [];
  for (const card of cards) {
    for (let i = 0; i < card.quantity; i++) {
      instances.push({
        instanceId: `${card.id}-${i + 1}`,
        cardId: card.id,
      });
    }
  }
  return instances;
}

function shuffle(cards: CardInstance[]): CardInstance[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export async function buildPlayerDecks(
  villainId: string,
): Promise<PlayerCardsState> {
  const decks = await DeckPrismaModel.getByVillainId(villainId);

  const villainDeck = decks.find((deck) => deck.type === 'VILLAIN');
  const fateDeck = decks.find((deck) => deck.type === 'FATE');

  if (!villainDeck || !fateDeck) {
    throw new Error(`Faltan mazos para el villano "${villainId}"`);
  }

  return {
    villainDeck: {
      drawPile: shuffle(createCardInstances(villainDeck.cards)),
      discardPile: [],
    },
    fateDeck: {
      drawPile: shuffle(createCardInstances(fateDeck.cards)),
      discardPile: [],
    },
    hand: [],
  };
}
