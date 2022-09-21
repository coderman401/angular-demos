import { formatDate } from '@angular/common';
import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { filter } from 'rxjs';
import { Contact } from '../../models/contact.model';
import { Message } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

  messages: Message[] = [];

  constructor(public chatService: ChatService, @Inject(LOCALE_ID) private locale: string) { }

  ngOnInit(): void {
    this.watchContactChange();
  }

  watchContactChange() {
    this.chatService.selectedContact$.subscribe((contact: Contact | null) => {
      if (contact) {
        this.messages = [];
        this.getUserChat(contact);
      }
    });
  }

  getUserChat(contact: Contact) {
    this.messages = [];
    this.chatService.getMessages(contact).subscribe((response: Message[]) => {
      this.messages = response.map((m: Message) => ({ ...m, date: formatDate(m.timestamp, 'MMMM d, YYYY', this.locale) })).sort((a: Message, b: Message) => b.timestamp - a.timestamp)
    });
  }

  checkForHeader(i: number, message: Message) {
    let next;
    let current;
    if (this.messages[i + 1]) {
      next = this.messages[i + 1]?.date;
    }
    current = message?.date;
    return next !== current;
  }

}
