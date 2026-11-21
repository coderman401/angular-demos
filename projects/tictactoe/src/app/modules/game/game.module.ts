import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { StateTableComponent } from './components/state-table/state-table.component';
import { CommonLibraryModule } from 'common-library';
import { BoardComponent } from './components/board/board.component';
import { MarkComponent } from './components/mark/mark.component';
import { MascotComponent } from './components/mascot/mascot.component';
import { ConfettiComponent } from './components/confetti/confetti.component';
import { ConfirmComponent } from './components/confirm/confirm.component';


@NgModule({
  declarations: [
    GameComponent,
    StateTableComponent,
    BoardComponent,
    MarkComponent,
    MascotComponent,
    ConfettiComponent,
    ConfirmComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    CommonLibraryModule
  ]
})
export class GameModule { }
