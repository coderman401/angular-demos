import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { CommonLibraryModule } from 'common-library';

@NgModule({
  declarations: [ChatComponent],
  imports: [CommonModule, CommonLibraryModule, ChatRoutingModule],
})
export class ChatModule {}
