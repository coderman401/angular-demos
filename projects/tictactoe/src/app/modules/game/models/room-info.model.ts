export type Mark = 'X' | 'O';

export interface RoomPlayer {
  name: string;
  connected: boolean;
}

/** Authoritative room state as broadcast by the xo-socket server. */
export interface RoomState {
  id: string;
  players: Record<Mark, RoomPlayer | null>;
  board: ('' | Mark)[];
  turn: Mark;
  status: 'waiting' | 'playing' | 'finished';
  winner: Mark | 'draw' | null;
  line: number[];
  scores: { X: number; O: number; draw: number };
  round: number;
  /** Time until the server allows the next round (only while status is 'finished'). */
  nextRoundInMs: number | null;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'offline';

export interface OnlineState {
  connection: ConnectionStatus;
  room: RoomState | null;
  you: Mark | null;
  /** Local timestamp (ms) at which the next round starts; null unless a round just finished. */
  nextRoundAt: number | null;
}

export interface SocketAck {
  ok: boolean;
  code?: string;
  error?: string;
  room?: RoomState;
  you?: Mark;
  playerId?: string;
  retryInMs?: number;
}
