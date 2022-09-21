import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'common-library';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor(public chatService: ChatService, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.chatService.currentUser = this.localStorageService.getItem('user');
  }

  redirectTo(url: string) {
    window.open(url, '_blank');
  }

}
