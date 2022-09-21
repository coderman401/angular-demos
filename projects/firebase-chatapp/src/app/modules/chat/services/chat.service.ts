import { Injectable } from "@angular/core";
import { FirebaseDatabaseService, FirebaseFirestoreService } from "common-library";
import { BehaviorSubject, Observable } from "rxjs";
import { Contact } from "../models/contact.model";
import { map } from 'rxjs/operators';
import { Message } from "../models/message.model";

@Injectable({
  providedIn: 'root'
})


export class ChatService {

  private _selectedContact = new BehaviorSubject<Contact | null>(null);
  private _contactList: Contact[] = [];
  private _currentUser!: Contact;
  private _loader = true;

  constructor(private fireStoreService: FirebaseFirestoreService, private databaseService: FirebaseDatabaseService) {
    this.getContactList();
  }

  //#region getter-setter
  get contactList(): Contact[] { return this._contactList; }
  set contactList(value: Contact[]) { this._contactList = value; }

  get selectedContact(): Contact | null { return this._selectedContact.getValue(); }
  get selectedContact$(): Observable<Contact | null> { return this._selectedContact.asObservable(); }
  set selectedContact(value: Contact | null) { if (value) this._selectedContact.next(value); }

  get currentUser(): Contact { return this._currentUser; }
  set currentUser(value: Contact) { this._currentUser = value; }

  get loader(): boolean { return this._loader }
  set loader(value: boolean) { this._loader = value; }
  //#endregion getter-setter


  getContactList() {
    // this.updateUserStatus();
    this.fireStoreService.getValueChanges('users').subscribe((response: any[]) => {
      let list = response.filter((s: any) => s.email !== this.currentUser.email)
      this.contactList = this.generateInitials(list);
      this.loader = false;
      // if (!this.selectedContact?.email) {
      //   this.selectedContact = this.contactList[0];
      // }
    });
  }

  getMessages(receiver: Contact) {
    const chatId = this.generateChatId(receiver.userId);
    return this.databaseService.getSnapshotChanges(`${chatId}/messages`).pipe(map((messages: Message[]) => {
      this.loader = false;
      return messages;
    }));
  }

  sendMessage(message: string) {
    if (this.selectedContact) {
      const data: Message = new Message(
        this.currentUser.userId,
        this.selectedContact?.userId,
        message,
      );
      const chatId = this.generateChatId(this.selectedContact.userId);
      this.pushMessage(chatId, data);
    }
  }

  updateUserStatus() {
    this.updateOnlineStatus(this.currentUser.userId, 'online');
  }

  pushMessage(chatId: string, messageData: Message) {
    return this.databaseService.createItemInDB(`${chatId}/messages`, messageData);
  }

  updateOnlineStatus(docId: string, status: string) {
    return this.fireStoreService.updateItemInAFS('users', docId, { status });
  }

  private generateChatId(receiverId: string) {
    let chatId = '';

    const cUId = this.currentUser.userId.substring(2, 8);
    const rUId = receiverId.substring(2, 8);

    if (cUId <= rUId) {
      chatId = `${cUId}-${rUId}`;
    } else {
      chatId = `${rUId}-${cUId}`;
    }
    return chatId;
  }

  private generateInitials(list: Contact[]) {
    return list.map((l) => {
      const nameArr = l.name.split(' ').filter((n) => n);
      if (nameArr.length > 1) {
        l.initials = nameArr[0][0].toUpperCase() + nameArr[1][0].toUpperCase();
      } else {
        l.initials = nameArr[0].split('').splice(0, 2).join('');
      }
      return l;
    });
  }

}
