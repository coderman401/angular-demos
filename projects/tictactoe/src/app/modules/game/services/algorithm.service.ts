import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlgorithmService {

  constructor() { }
  // logic
  arrayToMat(squares: string[]) {
    const mat: any[] = [];
    let k = 0;
    for (let i = 0; i < 3; i++) {
      mat[i] = [];
      for (let j = 0; j < 3; j++) { mat[i][j] = squares[k++]; }
    }
    return mat;
  }

  hasMovesLeft(mat: string[]) {
    // If it has an empty space, keep playing
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[i][j] === '') { return true; }
      }
    }
    return false;
  }

  checkWin(mat: string[]) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (mat[a] && mat[a] === mat[b] && mat[a] === mat[c]) {
        return true;
      }
    }
    return false;
  }

  evaluate(mat: string[], depth: number) {
    // Check every row
    for (let i = 0; i < 3; i++) {
      if (mat[i][0] === mat[i][1] && mat[i][0] === mat[i][2] && mat[i][1] === mat[i][2]) {
        if (mat[i][0] === 'X') { return 100 - depth; }
        if (mat[i][0] === 'O') { return depth - 100; }
      }
    }

    // Check every col
    for (let j = 0; j < 3; j++) {
      if (mat[0][j] === mat[1][j] && mat[0][j] === mat[2][j] && mat[1][j] === mat[2][j]) {
        if (mat[0][j] === 'X') { return 100 - depth; }
        if (mat[0][j] === 'O') { return depth - 100; }
      }
    }

    // Check the diagonals
    if (mat[0][0] === mat[1][1] && mat[0][0] === mat[2][2] && mat[1][1] === mat[2][2]) {
      if (mat[0][0] === 'X') { return 100 - depth; }
      if (mat[0][0] === 'O') { return depth - 100; }
    }

    if (mat[0][2] === mat[1][1] && mat[0][2] === mat[2][0] && mat[1][1] === mat[2][0]) {
      if (mat[0][2] === 'X') { return 100 - depth; }
      if (mat[0][2] === 'O') { return depth - 100; }
    }

    // If the game hasn't finished yet
    return 0;
  }

  minmax(mat: any[], depth: number, getMax: boolean) {
    if (this.hasMovesLeft(mat) === false) {
      return this.evaluate(mat, depth);
    }

    const val = this.evaluate(mat, depth);

    if (val !== 0) { return val; }

    if (getMax) {
      let best = -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (mat[i][j] === '') {
            mat[i][j] = 'X';
            best = Math.max(best, this.minmax(mat, depth + 1, !getMax));
            mat[i][j] = '';
          }
        }
      }
      return best;
    }
    else {
      let best = Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (mat[i][j] === '') {
            mat[i][j] = 'O';
            best = Math.min(best, this.minmax(mat, depth + 1, !getMax));
            mat[i][j] = '';
          }
        }
      }
      return best;
    }

  }

  findBestMove(squares: string[], difficulty: string) {
    const mat = this.arrayToMat(squares);
    let val: number;
    let row = -1;
    let col = -1;
    let best = -Infinity;

    if (this.checkWin(squares) === false) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (mat[i][j] === '') {
            if (difficulty === 'easy') {
              mat[i][j] = 'O';
            } else if (difficulty === 'hard') {
              mat[i][j] = 'x';
            } else if (difficulty === 'expert') {
              mat[i][j] = 'X';
            }
            val = this.minmax(mat, 0, false);
            mat[i][j] = '';
            if (val > best) {
              best = val;
              row = i;
              col = j;
            }
          }
        }
      }
      return (3 * row) + col;
    }
    return -4;
  }
}
