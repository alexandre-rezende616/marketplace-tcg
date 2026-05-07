import React, { createContext, useState, useContext } from 'react';

export type User = { 
  id: number; 
  email: string; 
  role: string; 
  avatarUrl?: string | null; 
  nickname?: string | null; 
};

interface AuthContextData {
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (loggedUser: User) => setUser(loggedUser);
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
