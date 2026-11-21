import { Injectable } from '@angular/core';
import { LocalStorageService } from 'common-library';

import { WinningCount } from '../models/winning-count.model';
import { AlgorithmService } from './algorithm.service';

export type LocalMark = 'X' | 'O';

/** Outcome of a finished local round. The board stays visible until `nextRound()`. */
export interface LocalResult {
  winner: LocalMark | 'draw';
  line: number[];
}

const AI_THINK_MS = 450;

/**
 * Local play: "single" (you are O, the computer is X) and "two" (pass and play).
 * Online play is server-authoritative and lives in SocketService.
 */
@Injectable({
  providedIn: 'root'
})
export class GameService {

  private _squares: string[] = Array(9).fill('');
  private _xIsNext = true;
  private _player = 'single';
  private _difficulty = 'expert';
  private _winningCount = new WinningCount();
  private aiTimer?: ReturnType<typeof setTimeout>;
  /** Who opens the next two-player round; alternates every round. */
  private twoPlayerStarter: LocalMark = 'X';

  result: LocalResult | null = null;
  aiThinking = false;
  lastMove: number | null = null;
  /** Current run of wins for "You" in single player (persisted). */
  streak = 0;

  readonly lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  constructor(
    private localStorageService: LocalStorageService,
    private AIService: AlgorithmService,
  ) {
    this.setWinnerCounts();
    this.streak = Number(this.localStorageService.getItem('xo.streak')) || 0;
  }

  //#region getters-setters

  get squares(): string[] { return this._squares; }
  set squares(squares: string[]) { this._squares = squares; }

  get player(): string { return this._player; }
  setPlayer(player: string) { this._player = player; }

  get winningCount(): WinningCount { return this._winningCount; }
  set winningCount(data: WinningCount) { this._winningCount = data; }

  get xIsNext(): boolean { return this._xIsNext; }
  set xIsNext(value: boolean) { this._xIsNext = value; }

  get difficulty(): string { return this._difficulty; }
  set difficulty(value: string) { this._difficulty = value; }

  /** True when a click on the board should be ignored. */
  get locked(): boolean { return !!this.result || this.aiThinking; }

  //#endregion getters-setters

  setWinnerCounts() {
    const saved = this.localStorageService.getItem('winningCount');
    if (saved) {
      this.winningCount = saved;
    } else {
      this.localStorageService.setItem('winningCount', this.winningCount);
    }
  }

  calculateWinner(squares: string[]) {
    for (const [a, b, c] of this.lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return null;
  }

  /** Plays a human move. Returns the mark placed, or null if the move was ignored. */
  updateSquare(index: number): LocalMark | null {
    if (this.locked || this.squares[index]) {
      return null;
    }

    if (this.player === 'two') {
      const mark: LocalMark = this.xIsNext ? 'X' : 'O';
      this.place(index, mark);
      this.xIsNext = !this.xIsNext;
      this.evaluate();
      return mark;
    }

    if (this.player === 'single') {
      this.place(index, 'O');
      if (this.evaluate()) {
        return 'O';
      }
      this.aiThinking = true;
      this.aiTimer = setTimeout(() => {
        this.aiThinking = false;
        const aiIndex = this.AIService.findBestMove(this.squares, this.difficulty);
        if (aiIndex >= 0 && !this.squares[aiIndex]) {
          this.place(aiIndex, 'X');
        }
        this.evaluate();
        this.onAiMove?.(aiIndex);
      }, AI_THINK_MS);
      return 'O';
    }
    return null;
  }

  /** Optional hook so the UI can react (sound, focus) when the computer has moved. */
  onAiMove?: (index: number) => void;

  /** Starts the next local round after a result. */
  nextRound() {
    if (this.player === 'two') {
      this.twoPlayerStarter = this.twoPlayerStarter === 'X' ? 'O' : 'X';
      this.xIsNext = this.twoPlayerStarter === 'X';
    } else {
      this.xIsNext = false; // single player: you always open
    }
    this.clearBoard();
  }

  /** Clears the board when switching modes or difficulty (no score change). */
  resetGame() {
    this.twoPlayerStarter = 'X';
    this.clearBoard();
  }

  private clearBoard() {
    if (this.aiTimer) clearTimeout(this.aiTimer);
    this.aiThinking = false;
    this.result = null;
    this.lastMove = null;
    this.squares = Array(9).fill('');
  }

  private place(index: number, mark: LocalMark) {
    this.squares[index] = mark;
    this.lastMove = index;
  }

  /** Records a finished round. Returns true if the round is over. */
  private evaluate(): boolean {
    const win = this.calculateWinner(this.squares);
    const full = !this.squares.includes('');
    if (!win && !full) {
      return false;
    }
    const winner = (win?.winner ?? 'draw') as LocalMark | 'draw';
    const bucket = this.player === 'single' ? this.winningCount.one : this.winningCount.two;
    if (winner === 'X') bucket.xWins += 1;
    else if (winner === 'O') bucket.oWins += 1;
    else bucket.draw += 1;
    this.localStorageService.setItem('winningCount', this.winningCount);

    if (this.player === 'single') {
      this.streak = winner === 'O' ? this.streak + 1 : 0;
      this.localStorageService.setItem('xo.streak', this.streak);
    }
    this.result = { winner, line: win?.line ?? [] };
    return true;
  }

}
