import type { CardInstance, GameState } from '../types/game.types';
import { drawVillainCards } from './deck.services';

export function drawForPlayer(
  game: GameState,
  userId: number,
  amount: number,
): CardInstance[] {
  const player = game.players.find((player) => player.userId === userId);

  if (!player) {
    throw new Error('The player is not part of the game');
  }

  if (game.status !== 'IN_PROGRESS') {
    throw new Error('The game is not in progress');
  }

  if (game.currentPlayerId !== userId) {
    throw new Error('The player is not the current player');
  }

  return drawVillainCards(player.cards, amount);
}
