export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneDto {
  projectId: string;
  title: string;
  date: string;
}

export interface UpdateMilestoneDto {
  title?: string;
  date?: string;
  completed?: boolean;
}
