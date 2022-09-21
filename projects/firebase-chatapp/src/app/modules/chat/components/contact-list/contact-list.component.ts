import { Component, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { MatSelectionListChange } from '@angular/material/list';
import { AuthService } from '../../../auth/services/auth.service';
import { Contact } from '../../models/contact.model';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {

  constructor(public chatService: ChatService, private authService: AuthService) { }

  ngOnInit(): void {}

  selectContact(event: MatSelectionListChange) {
    const userId = event.options[0]?.value;
    if (userId) {
      const contact = this.chatService.contactList.find((u) => u.userId === userId);
      if (contact) {
        this.chatService.selectedContact = contact;
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
