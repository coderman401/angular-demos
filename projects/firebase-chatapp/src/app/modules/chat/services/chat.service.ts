import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Contact } from "../models/contact.model";

@Injectable({
  providedIn: 'root'
})


export class ChatService {

  private _selectedContact = new BehaviorSubject<Contact | null>(null);
  private _contactList: Contact[] = [];

  constructor() {
    this.getContactList();
  }

  //#region getter-setter
  get contactList(): Contact[] { return this._contactList; }
  set contactList(value: Contact[]) { this._contactList = value; }

  get selectedContact(): Contact | null { return this._selectedContact.getValue(); }
  get selectedContact$(): Observable<Contact | null> { return this._selectedContact.asObservable(); }
  set selectedContact(value: Contact | null) { if (value) this._selectedContact.next(value); }
  //#endregion getter-setter

  private getContactList() {
    this.contactList = this.generateInitials(CONTACT_LIST);
    this.selectedContact = this.contactList[0];
  }

  private generateInitials(list: Contact[]) {
    return list.map((l) => {
      const nameArr = l.name.split(' ');
      if (nameArr.length > 1) {
        l.initials = nameArr[0][0].toUpperCase() + nameArr[1][0].toUpperCase();
      } else {
        l.initials = nameArr[0].split('').splice(0, 2).join('');
      }
      return l;
    });
  }

}

const CONTACT_LIST: Contact[] = [
  {
    "userId": "1",
    "name": "LeanneGraham",
    "email": "Sincere@april.biz",
    "active": false,
    "online": false,
  },
  {
    "userId": "2",
    "name": "Ervin Howell",
    "email": "Shanna@melissa.tv",
    "active": true,
    "online": false,
  },
  {
    "userId": "3",
    "name": "Clementine Bauch",
    "email": "Nathan@yesenia.net",
    "active": false,
    "online": false,
  },
  {
    "userId": "4",
    "name": "Patricia Lebsack",
    "email": "Julianne.OConner@kory.org",
    "active": false,
    "online": false,
  },
  {
    "userId": "5",
    "name": "Chelsey Dietrich",
    "email": "Lucio_Hettinger@annie.ca",
    "active": false,
    "online": false,
  },
  {
    "userId": "6",
    "name": "Mrs. Dennis Schulist",
    "email": "Karley_Dach@jasper.info",
    "active": false,
    "online": false,
  },
  {
    "userId": "7",
    "name": "Kurtis Weissnat",
    "email": "Telly.Hoeger@billy.biz",
    "active": false,
    "online": false,
  },
  {
    "userId": "8",
    "name": "Nicholas Runolfsdottir V",
    "email": "Sherwood@rosamond.me",
    "active": false,
    "online": false,
  },
  {
    "userId": "9",
    "name": "Glenna Reichert",
    "email": "Chaim_McDermott@dana.io",
    "active": false,
    "online": false,
  },
  {
    "userId": "10",
    "name": "Clementina DuBuque",
    "email": "Rey.Padberg@karina.biz",
    "active": false,
    "online": false,
  }
];

