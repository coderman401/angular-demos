export interface RoomInfo {
  message?: string;
  player_name?: string;
  player_turn: boolean;
  is_player_joined?: boolean;
  roomId?: string;
  player_type: 'X' | 'O' | string;
  turn?: string;
  roomObj?: RoomObj
}

export interface RoomObj {
  player1: string;
  player2: string;
  roomId: string;
}
