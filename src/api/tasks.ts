import { apiGet, apiPost, apiDelete } from './client';

export type TaskCategory =
  | 'Transportation'
  | 'Errands'
  | 'Friendly Visit'
  | 'Tech Support'
  | 'Home Task'
  | 'Glass Recycling'
  | 'Phone Check-In';

export interface ApiTask {
  id: number;
  memberId: string;
  memberName: string;
  memberFullName: string;
  memberAge: number | null;
  memberTown: string | null;
  memberAvatar: string | null;
  memberBio: string | null;
  category: TaskCategory;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  status: 'Open' | 'Claimed' | 'Completed' | 'Cancelled';
  postedDate: string;
  claimedById: string | null;
  claimedByName: string | null;
  claimedByAvatar: string | null;
}

export interface ApiVolRequest {
  requestId: number;
  taskId: number;
  volunteerId: string;
  volunteerFirstName: string;
  volunteerFullName: string;
  volunteerAvatar: string | null;
  volunteerBio: string | null;
  volunteerSkills: string | null;
  requestedAt: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

export interface ApiMemberTask extends ApiTask {
  requests: ApiVolRequest[];
}

export interface ApiHistoryEntry {
  id: number;
  category: TaskCategory;
  description: string;
  completedDate: string;
  volunteerName: string;
  volunteerAvatar: string | null;
}

export interface TaskFormData {
  category: TaskCategory;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  notes: string;
}

export const fetchAllTasks = () => apiGet<ApiTask[]>('/api/tasks');

export const fetchVolunteerRequests = (volId: string) =>
  apiGet<ApiVolRequest[]>(`/api/volunteers/${volId}/my-requests`);

export const requestTask = (taskId: number, volId: string) =>
  apiPost<ApiTask>(`/api/tasks/${taskId}/request`, { volunteerId: volId });

export const cancelTaskRequest = (taskId: number, volId: string) =>
  apiDelete<{ ok: boolean }>(`/api/tasks/${taskId}/request`, { volunteerId: volId });

export const fetchMemberTasks = (memberId: string) =>
  apiGet<ApiMemberTask[]>(`/api/members/${memberId}/tasks`);

export const fetchMemberHistory = (memberId: string) =>
  apiGet<ApiHistoryEntry[]>(`/api/members/${memberId}/history`);

export const createTask = (memberId: string, data: TaskFormData) =>
  apiPost<ApiMemberTask>(`/api/members/${memberId}/tasks`, data);

export const cancelTask = (taskId: number) =>
  apiDelete<{ ok: boolean }>(`/api/tasks/${taskId}`);

export const confirmRequest = (requestId: number) =>
  apiPost<{ ok: boolean }>(`/api/requests/${requestId}/confirm`, {});

export const declineRequest = (requestId: number) =>
  apiPost<{ ok: boolean }>(`/api/requests/${requestId}/decline`, {});
