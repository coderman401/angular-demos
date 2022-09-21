import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatHeaderComponent } from './components/chat-header/chat-header.component';
import { CommonLibraryModule } from 'common-library';
import { ChatFooterComponent } from './components/chat-footer/chat-footer.component';


@NgModule({
  declarations: [
    ChatComponent,
    ContactListComponent,
    ChatBoxComponent,
    ChatHeaderComponent,
    ChatFooterComponent
  ],
  imports: [
    CommonLibraryModule,
    ChatRoutingModule
  ]
})
export class ChatModule { }
