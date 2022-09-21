export class Message {
  senderId!: string;
  receiverId!: string;
  content!: string;
  timestamp!: number;
  type!: string;
  date!: string;

  constructor(senderId: string, receiverId: string, content: string, type = 'text') {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.type = type;
    this.timestamp = new Date()?.getTime();
    this.date = '';
  }
}
