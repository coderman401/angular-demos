import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonLibraryModule } from 'common-library';
import { BehaviorSubject } from 'rxjs';

import { BoardComponent } from './components/board/board.component';
import { MarkComponent } from './components/mark/mark.component';
import { GameComponent } from './game.component';
import { OnlineState, RoomState } from './models/room-info.model';
import { SocketService } from './services/socket.service';
import { SoundService } from '../../services/sound.service';
import { MascotComponent } from './components/mascot/mascot.component';
import { ConfettiComponent } from './components/confetti/confetti.component';

class FakeSocketService {
  state = new BehaviorSubject<OnlineState>({ connection: 'idle', room: null, you: null, nextRoundAt: null });
  state$ = this.state.asObservable();
  hasSavedSession = false;
  connect = jasmine.createSpy('connect');
  disconnect = jasmine.createSpy('disconnect').and.resolveTo();
  playTurn = jasmine.createSpy('playTurn').and.resolveTo({ ok: true });
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
  nextRoundInMs: null,
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
      declarations: [GameComponent, BoardComponent, MarkComponent, MascotComponent, ConfettiComponent],
      providers: [
        { provide: SocketService, useValue: socket },
        { provide: SoundService, useValue: { enabled: false, play: () => { }, toggle: () => { } } },
      ],
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
    component.selectMode('friend');
    expect(socket.connect).toHaveBeenCalled();
    component.selectMode('single');
    expect(socket.disconnect).toHaveBeenCalled();
  });

  describe('online room', () => {
    beforeEach(() => {
      component.selectMode('friend');
    });

    it('renders the server board and sends moves only on my turn', async () => {
      socket.state.next({ connection: 'connected', you: 'X', nextRoundAt: null, room: room({ board: ['O', '', '', '', '', '', '', '', ''] }) });
      fixture.detectChanges();
      expect(el().textContent).toContain('Your turn');
      const cells = el().querySelectorAll<HTMLButtonElement>('board button.tile');
      expect(cells[0].classList).toContain('o');

      cells[4].click();
      expect(socket.playTurn).toHaveBeenCalledWith(4);

      socket.playTurn.calls.reset();
      cells[0].click(); // occupied
      expect(socket.playTurn).not.toHaveBeenCalled();
    });

    it('locks the board on the opponent\'s turn', () => {
      socket.state.next({ connection: 'connected', you: 'O', nextRoundAt: null, room: room() });
      fixture.detectChanges();
      expect(el().textContent).toContain('Alice is thinking');
      el().querySelectorAll<HTMLButtonElement>('board button.tile')[4].click();
      expect(socket.playTurn).not.toHaveBeenCalled();
    });

    it('shows the invite (room code, copy code, copy link) only until the second player joins', () => {
      socket.state.next({ connection: 'connected', you: 'X', nextRoundAt: null, room: room({ status: 'waiting', players: { X: { name: 'Alice', connected: true }, O: null } }) });
      fixture.detectChanges();
      const buttons = () => Array.from(el().querySelectorAll('button')).map((b) => b.textContent?.trim());
      expect(el().querySelector('.invite__code')?.textContent).toContain('K7QF2M');
      expect(buttons().some((t) => t?.endsWith('Copy code'))).toBeTrue();
      expect(buttons().some((t) => t?.endsWith('Copy invite link'))).toBeTrue();

      // opponent joins -> invite disappears, game starts
      socket.state.next({ connection: 'connected', you: 'X', nextRoundAt: null, room: room() });
      fixture.detectChanges();
      expect(el().querySelector('.invite')).toBeNull();
      expect(buttons().some((t) => t?.includes('Copy'))).toBeFalse();

      // opponent leaves -> invite is available again
      socket.state.next({ connection: 'connected', you: 'X', nextRoundAt: null, room: room({ status: 'waiting', players: { X: { name: 'Alice', connected: true }, O: null } }) });
      fixture.detectChanges();
      expect(el().querySelector('.invite')).not.toBeNull();
    });

    it('a finished round shows the result banner, winning line and countdown; no rematch button', () => {
      const now = Date.now();
      socket.state.next({
        connection: 'connected', you: 'O', nextRoundAt: now + 2500,
        room: room({ status: 'finished', winner: 'X', line: [0, 1, 2], scores: { X: 2, O: 1, draw: 1 }, round: 4, nextRoundInMs: 2500 }),
      });
      component.secondsLeft = 3;
      fixture.detectChanges();
      expect(el().textContent).toContain('Alice won');
      expect(el().querySelector('.sheet')?.textContent).toContain('Next round in 3');
      expect(el().querySelectorAll('board .tile.win').length).toBe(3);
      expect(el().querySelector('.sheet--lose .sheet__timer')).not.toBeNull();
      expect(Array.from(el().querySelectorAll('button')).some((b) => /again|rematch/i.test(b.textContent ?? ''))).toBeFalse();
      const scores = Array.from(el().querySelectorAll('.match__score')).map((s) => s.textContent?.trim());
      expect(scores).toEqual(['2', '1']);
      expect(el().querySelector('.match__draws')?.textContent?.trim()).toBe('1 draw');
    });

    it('shows when the opponent dropped', () => {
      socket.state.next({ connection: 'connected', you: 'X', nextRoundAt: null, room: room({ players: { X: { name: 'Alice', connected: true }, O: { name: 'Bob', connected: false } } }) });
      fixture.detectChanges();
      expect(el().textContent).toContain('Bob dropped out');
    });
  });
});
