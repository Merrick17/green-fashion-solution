export interface CreateWaitlistDto {
  name: string;
  email: string;
  brand: string;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
}
