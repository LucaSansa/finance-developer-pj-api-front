export type User = {
  name: string;
  email: string;
  cnpj: string;
};

export type Session = {
  access_token: string;
};

export type UseSession = {
  session: Session | null;
  user: User | null;
  createSession: (session: Session, user: User) => void;
  destroySession: () => void;
};
