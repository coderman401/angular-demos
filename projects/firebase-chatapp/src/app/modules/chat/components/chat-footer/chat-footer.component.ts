import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-footer',
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss']
})
export class ChatFooterComponent implements OnInit {

  message!: string;
  @Output() send = new EventEmitter();
  @ViewChild('textBox', { static: true }) textBox!: ElementRef;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
  }

  sendMessage() {
    if (this.message.trim() !== '' || this.message.trim().length !== 0) {
      this.chatService.sendMessage(this.message.trim());
    }
    this.message = '';
    this.resize();
  }


  resize() {
    if (this.message?.includes('\n')) {
      let newLines = this.message.split('\n').length;
      newLines = newLines > 5 ? 5 : newLines;
      this.textBox.nativeElement.style.height = (1.6 * newLines) + 'rem';
    } else {
      this.textBox.nativeElement.style.height = '1.6rem';
    }
  }
}
