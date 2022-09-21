export interface Contact {
  name: string;
  email: string;
  userId: string;
  emailVerified: boolean;
  profileImage?: string;
  metadata: any;
  active?: boolean;
  online?: boolean;
  initials?: string;
  hasMessages?: boolean;
}
