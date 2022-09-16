import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { StateTableComponent } from './components/state-table/state-table.component';
import { CommonLibraryModule } from 'common-library';
import { BoardComponent } from './components/board/board.component';


@NgModule({
  declarations: [
    GameComponent,
    StateTableComponent,
    BoardComponent,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    CommonLibraryModule
  ]
})
export class GameModule { }
