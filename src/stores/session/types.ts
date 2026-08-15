type User = {
  name: string;
  email: string;
  cnpj: string;
};

export type Session = {
  token: string;
  user: User;
};

export type UseSession = {
  session: Session | null;
  createSession: (session: Session) => void;
  destroySession: () => void;
};
