export interface Contact {
  name: string;
  email: string;
  userId: string;
  active: boolean;
  online: boolean;
  profileImage?: string;
  initials?: string;
  hasMessages?: boolean;
}
