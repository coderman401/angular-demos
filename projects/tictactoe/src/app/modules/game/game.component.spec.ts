import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonLibraryModule } from 'common-library';
import { BehaviorSubject } from 'rxjs';

import { BoardComponent } from './components/board/board.component';
import { GameComponent } from './game.component';
import { OnlineState, RoomState } from './models/room-info.model';
import { SocketService } from './services/socket.service';

class FakeSocketService {
  state = new BehaviorSubject<OnlineState>({ connection: 'idle', room: null, you: null });
  state$ = this.state.asObservable();
  hasSavedSession = false;
  connect = jasmine.createSpy('connect');
  disconnect = jasmine.createSpy('disconnect').and.resolveTo();
  playTurn = jasmine.createSpy('playTurn').and.resolveTo({ ok: true });
  rematch = jasmine.createSpy('rematch').and.resolveTo({ ok: true });
  leaveGame = jasmine.createSpy('leaveGame').and.resolveTo({ ok: true });
  get isMyTurn() {
    const { room, you } = this.state.value;
    return !!room && room.status === 'playing' && room.turn === you;
  }
}

const room = (over: Partial<RoomState> = {}): RoomState => ({
  id: 'K7QF2M',
  players: { X: { name: 'Alice', connected: true }, O: { name: 'Bob', connected: true } },
  board: ['', '', '', '', '', '', '', '', ''],
  turn: 'X',
  status: 'playing',
  winner: null,
  line: [],
  scores: { X: 0, O: 0, draw: 0 },
  round: 1,
  rematch: { X: false, O: false },
  ...over,
});

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let socket: FakeSocketService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    socket = new FakeSocketService();
    await TestBed.configureTestingModule({
      imports: [CommonLibraryModule, NoopAnimationsModule, RouterTestingModule],
      declarations: [GameComponent, BoardComponent],
      providers: [{ provide: SocketService, useValue: socket }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in single player mode without connecting', () => {
    expect(component).toBeTruthy();
    expect(socket.connect).not.toHaveBeenCalled();
  });

  it('connects only when "Play with Friend" is selected, and disconnects when leaving it', () => {
    component.changePlayer({ value: 'friend' } as any);
    expect(socket.connect).toHaveBeenCalled();
    component.changePlayer({ value: 'single' } as any);
    expect(socket.disconnect).toHaveBeenCalled();
  });

  describe('online room', () => {
    beforeEach(() => {
      component.changePlayer({ value: 'friend' } as any);
    });

    it('renders the server board and sends moves only on my turn', async () => {
      socket.state.next({ connection: 'connected', you: 'X', room: room({ board: ['O', '', '', '', '', '', '', '', ''] }) });
      fixture.detectChanges();
      expect(el().textContent).toContain('Your turn');
      const cells = el().querySelectorAll<HTMLButtonElement>('board button.square');
      expect(cells[0].textContent?.trim()).toBe('O');

      cells[4].click();
      expect(socket.playTurn).toHaveBeenCalledWith(4);

      socket.playTurn.calls.reset();
      cells[0].click(); // occupied
      expect(socket.playTurn).not.toHaveBeenCalled();
    });

    it('locks the board on the opponent\'s turn', () => {
      socket.state.next({ connection: 'connected', you: 'O', room: room() });
      fixture.detectChanges();
      expect(el().textContent).toContain('Alice\'s turn');
      el().querySelectorAll<HTMLButtonElement>('board button.square')[4].click();
      expect(socket.playTurn).not.toHaveBeenCalled();
    });

    it('offers a rematch after a round and shows the running score', () => {
      socket.state.next({
        connection: 'connected', you: 'O',
        room: room({ status: 'finished', winner: 'X', line: [0, 1, 2], scores: { X: 2, O: 1, draw: 1 }, round: 4, rematch: { X: true, O: false } }),
      });
      fixture.detectChanges();
      expect(el().textContent).toContain('Alice won');
      expect(el().textContent).toContain('Alice wants a rematch');
      expect(el().querySelectorAll('board button.square.win').length).toBe(3);
      const button = Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.includes('Accept rematch'))!;
      button.click();
      expect(socket.rematch).toHaveBeenCalled();
      const scores = Array.from(el().querySelectorAll('.game-stats .stats span')).map((s) => s.textContent);
      expect(scores).toEqual(['2', '1', '1']);
    });

    it('shows when the opponent dropped', () => {
      socket.state.next({ connection: 'connected', you: 'X', room: room({ players: { X: { name: 'Alice', connected: true }, O: { name: 'Bob', connected: false } } }) });
      fixture.detectChanges();
      expect(el().textContent).toContain('Bob lost connection');
    });
  });
});
