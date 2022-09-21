import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs';
import { Contact } from '../../models/contact.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit {

  constructor(public chatService: ChatService) { }

  ngOnInit(): void {
    this.watchContactChange();
  }

  watchContactChange() {
    this.chatService.selectedContact$.subscribe((contact: Contact | null) => {
        if (contact) {
          console.log('contact changed', 'refresh chat', contact);
        }
    });
  }

}
