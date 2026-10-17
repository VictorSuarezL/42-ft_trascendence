import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawVillainCards } from './deck.services';
import type { PlayerCardsState } from '../types/game.types';

test('drawVillainCards moves the last card from the draw pile to the hand', () => {
  const bottom = { instanceId: 'copy-1', cardId: 'example' };
  const top = { instanceId: 'copy-2', cardId: 'example' };

  const state: PlayerCardsState = {
    villainDeck: {
      drawPile: [bottom, top],
      discardPile: [],
    },
    fateDeck: {
      drawPile: [],
      discardPile: [],
    },
    hand: [],
  };

  const drawn = drawVillainCards(state, 1);

  assert.deepEqual(drawn, [top]);
  assert.deepEqual(state.hand, [top]);
  assert.deepEqual(state.villainDeck.drawPile, [bottom]);
});
