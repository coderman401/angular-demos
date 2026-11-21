import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
  let board: BoardComponent;
  let emitted: number[];

  beforeEach(() => {
    board = new BoardComponent({ nativeElement: document.createElement('div') } as any);
    emitted = [];
    board.cellClick.subscribe((i) => emitted.push(i));
  });

  it('emits clicks on empty cells', () => {
    board.clickSquare(3);
    expect(emitted).toEqual([3]);
  });

  it('ignores filled cells', () => {
    board.squares = ['X', '', '', '', '', '', '', '', ''];
    board.clickSquare(0);
    expect(emitted).toEqual([]);
  });

  it('ignores clicks while disabled', () => {
    board.disabled = true;
    board.clickSquare(1);
    expect(emitted).toEqual([]);
  });
});
