import type { Meeting } from './meeting';
import type { Milestone } from './milestone';
import type { Task } from './task';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'milestone' | 'task';
  status?: string;
  projectId?: string;
}

export interface CalendarResponse {
  meetings: Meeting[];
  milestones: Milestone[];
  tasks?: Pick<Task, 'id' | 'title' | 'dueDate' | 'status' | 'projectId'>[];
}
