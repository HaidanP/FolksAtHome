import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { loginApi, registerVolunteerApi, registerMemberApi } from '../api/auth';
import type { RegisterVolunteerPayload, RegisterMemberPayload } from '../api/auth';

export interface AppUser {
  id: string;
  role: 'volunteer' | 'member';
  email: string;
  firstName: string;
  lastName: string;
  avatarFile: string | null;
  status?: 'Approved' | 'Pending' | 'Rejected';
}

interface AuthCtx {
  user: AppUser | null;
  login: (email: string, password: string, role?: 'volunteer' | 'member') => Promise<AppUser>;
  logout: () => void;
  registerVolunteer: (payload: RegisterVolunteerPayload) => Promise<AppUser>;
  registerMember: (payload: RegisterMemberPayload) => Promise<AppUser>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const login = async (
    email: string,
    password: string,
    role?: 'volunteer' | 'member'
  ): Promise<AppUser> => {
    const apiUser = await loginApi({ email, password, role });
    const u: AppUser = {
      id:          apiUser.id,
      role:        apiUser.role,
      email:       apiUser.email,
      firstName:   apiUser.firstName,
      lastName:    apiUser.lastName,
      avatarFile:  apiUser.avatarFile,
      status:      apiUser.status,
    };
    setUser(u);
    return u;
  };

  const logout = () => setUser(null);

  const registerVolunteer = async (payload: RegisterVolunteerPayload): Promise<AppUser> => {
    const apiUser = await registerVolunteerApi(payload);
    const u: AppUser = {
      id:         apiUser.id,
      role:       'volunteer',
      email:      apiUser.email,
      firstName:  apiUser.firstName,
      lastName:   apiUser.lastName,
      avatarFile: apiUser.avatarFile,
      status:     'Approved',
    };
    setUser(u);
    return u;
  };

  const registerMember = async (payload: RegisterMemberPayload): Promise<AppUser> => {
    const apiUser = await registerMemberApi(payload);
    const u: AppUser = {
      id:         apiUser.id,
      role:       'member',
      email:      apiUser.email,
      firstName:  apiUser.firstName,
      lastName:   apiUser.lastName,
      avatarFile: apiUser.avatarFile,
      status:     'Pending',
    };
    setUser(u);
    return u;
  };

  return (
    <Ctx.Provider value={{ user, login, logout, registerVolunteer, registerMember }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
