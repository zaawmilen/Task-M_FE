// types/Task.ts
export interface User {
  _id: string;
  userId? : string;
  name: string;
  email: string;
  username: string;
  role: string;
     
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  dueDate?: string;
  user: User | string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}