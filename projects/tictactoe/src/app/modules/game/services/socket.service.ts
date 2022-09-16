import { Injectable } from "@angular/core";
import { ModalService } from "common-library";
import { Socket } from "ngx-socket-io";
import { take } from "rxjs";
import { RoomInfo } from "../models/room-info.model";
import { GameService } from "./game.service";

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  constructor(private socket: Socket, private gameService: GameService, private modalService: ModalService) { }

  initSocket() {
    this.newGame();
    this.playerOne();
    this.playerTwo();
    this.turnPlayed();
    this.gameEnd();
  }

  private playerOne() {
    this.socket.on('player1', (_data: any) => {
      const message = `Hello, ${this.gameService.roomInfo.player_name}`;
      this.gameService.roomInfo.message = message;
      this.gameService.roomInfo.is_player_joined = true;
    });
  }

  private playerTwo() {
    this.socket.on('player2', (data: any) => {
      const message = `Hello, ${data.playerName}`;
      this.gameService.isReady = true;
      this.gameService.roomInfo.is_player_joined = true;
      this.gameService.roomInfo.message = message;
      this.gameService.roomInfo.turn = 'Waiting For Opponent';
      this.gameService.roomInfo.roomId = data.room;
    });
  }

  private turnPlayed() {
    this.socket.on('turnPlayed', (data: any) => {
      const i = data.tile;
      const opponentType = this.gameService.roomInfo.player_type === 'X' ? 'O' : 'X';
      this.gameService.roomInfo.player_turn = true;
      this.gameService.roomInfo.message = 'Your Turn';
      const squares = this.gameService.squares;
      squares[i] = opponentType;
      this.gameService.squares = squares;
      this.gameService.xIsNext = !this.gameService.xIsNext;
    });
  }
  private gameEnd() {
    this.socket.on('gameEnd', (data: any) => {
      const winnerPlayer = data.winner;
      if (winnerPlayer === 'draw') {
        this.modalService.openAlert('Game Draw !!!');
      } else {
        this.modalService.openAlert(winnerPlayer + ' Won');
      }
      this.gameService.isReady = false;
      this.gameService.resetGame();
    });
  }

  private newGame() {
    this.socket.on('newGame', (data: any) => {
      const message = `Hello, ${data.playerName}. Please ask your friend to enter Game ID:
            ${data.room}. Waiting for player 2...`;
      this.gameService.roomInfo.message = message;
      this.gameService.roomInfo.is_player_joined = false;
      this.gameService.roomInfo.turn = 'Waiting For Opponent';
      this.gameService.roomInfo.roomId = data.room;
      this.gameService.isReady = true;
    });
  }



  createNewGame(playerName: string) {
    this.socket.emit('createGame', { playerName });
    const data: RoomInfo = {
      player_name: playerName,
      player_type: 'X',
      player_turn: true
    };
    this.gameService.roomInfo = data;
    this.gameService.xIsNext = true;
  }

  joinGame(playerName: string, roomId: string) {
    this.socket.emit('joinGame', { playerName, room: roomId });
    const data: RoomInfo = {
      player_name: playerName,
      player_type: 'O',
      player_turn: false,
    };
    this.gameService.roomInfo = data;
    this.gameService.xIsNext = true;
  }
}
