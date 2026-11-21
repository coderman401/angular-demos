import { fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';
import { AlgorithmService } from './algorithm.service';

class MemoryStorage {
  data: Record<string, unknown> = {};
  getItem(k: string) { return this.data[k] ?? null; }
  setItem(k: string, v: unknown) { this.data[k] = v; }
}

describe('GameService (local play)', () => {
  let game: GameService;

  beforeEach(() => {
    game = new GameService(new MemoryStorage() as any, new AlgorithmService());
  });

  it('pass & play: marks follow the turn indicator, the result stays on the board until the round restarts', () => {
    game.setPlayer('two');
    game.xIsNext = true;
    expect(game.updateSquare(0)).toBe('X');
    expect(game.updateSquare(3)).toBe('O');
    game.updateSquare(1); game.updateSquare(4); game.updateSquare(2);
    expect(game.result).toEqual({ winner: 'X', line: [0, 1, 2] });
    expect(game.updateSquare(8)).withContext('board is locked after a win').toBeNull();
    expect(game.winningCount.two.xWins).toBe(1);

    game.nextRound();
    expect(game.result).toBeNull();
    expect(game.squares.every((s) => !s)).toBeTrue();
    expect(game.xIsNext).withContext('the other player starts the next round').toBeFalse();
  });

  it('a finished local round restarts by itself after 3 seconds, no button needed', fakeAsync(() => {
    game.setPlayer('two');
    game.xIsNext = true;
    let restarted = 0;
    game.onAutoRestart = () => restarted++;
    for (const i of [0, 3, 1, 4, 2]) game.updateSquare(i);
    expect(game.result?.winner).toBe('X');
    expect(game.nextRoundAt).not.toBeNull();

    tick(2900);
    expect(game.result).withContext('still showing the result').not.toBeNull();
    tick(150);
    expect(game.result).toBeNull();
    expect(game.nextRoundAt).toBeNull();
    expect(game.squares.every((s) => !s)).toBeTrue();
    expect(restarted).toBe(1);
    expect(game.xIsNext).withContext('O starts round 2').toBeFalse();
  }));

  it('switching mode cancels the pending restart', fakeAsync(() => {
    game.setPlayer('two');
    for (const i of [0, 3, 1, 4, 2]) game.updateSquare(i);
    let restarted = 0;
    game.onAutoRestart = () => restarted++;
    game.resetGame();
    tick(4000);
    expect(restarted).toBe(0);
  }));

  it('single player: board locks while the computer thinks, then it replies', fakeAsync(() => {
    game.setPlayer('single');
    game.difficulty = 'expert';
    expect(game.updateSquare(4)).toBe('O');
    expect(game.aiThinking).toBeTrue();
    expect(game.updateSquare(0)).withContext('cannot play during the computer\'s turn').toBeNull();
    tick(500);
    expect(game.aiThinking).toBeFalse();
    expect(game.squares.filter((s) => s === 'X').length).toBe(1);
    expect(game.lastMove).not.toBe(4);
  }));

  it('single player: winning builds a streak, losing resets it', () => {
    game.setPlayer('single');
    game.squares = ['O', 'O', '', 'X', 'X', '', '', '', ''];
    game.updateSquare(2);
    expect(game.result?.winner).toBe('O');
    expect(game.streak).toBe(1);
    game.nextRound();
    game.squares = ['O', 'O', '', 'X', 'X', '', '', '', ''];
    game.updateSquare(2);
    expect(game.streak).toBe(2);
  });
});
