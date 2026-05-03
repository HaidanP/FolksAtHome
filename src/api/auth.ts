import { apiPost } from './client';
import type { ApiUser } from './client';

export interface LoginPayload {
  email: string;
  password: string;
  role?: 'volunteer' | 'member';
}

export interface RegisterVolunteerPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob?: string;
  homePhone?: string;
  cellPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  bio?: string;
  whyVolunteer?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelation?: string;
  hasLicense?: boolean;
  hasTransport?: boolean;
  bgCheck?: boolean;
  frequency?: string;
  startDate?: string;
  availability?: string[];
  skills?: string[];
  avatarData?: string;
}

export interface RegisterMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob?: string;
  homePhone?: string;
  cellPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  plan?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelation?: string;
  contactMethods?: string[];
  services?: string[];
  avatarData?: string;
}

export const loginApi = (payload: LoginPayload) =>
  apiPost<ApiUser>('/api/auth/login', payload);

export const registerVolunteerApi = (payload: RegisterVolunteerPayload) =>
  apiPost<ApiUser>('/api/auth/register/volunteer', payload);

export const registerMemberApi = (payload: RegisterMemberPayload) =>
  apiPost<ApiUser>('/api/auth/register/member', payload);
