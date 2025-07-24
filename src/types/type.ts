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
export interface AuthResponse {
  token: string;
  user: User;
}


export interface UsersResponse {
  users: User[];
}
export interface ApiResponse<T> {
  data: T;
}


export interface TasksResponse {
  tasks: Task[];
  page: number;
  totalPages: number;
}
export interface LoginResponse {
  token: string;
  user: User;
}
export interface RegisterResponse {
  user: User;
  token: string;
}

export interface TaskUpdateResponse {
  task: Task;
}
export interface TaskCreateResponse {
  task: Task;
}
export interface TaskDeleteResponse {
  message: string;
}
export interface TaskListResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
}
export interface TaskSearchResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
}
export interface TaskPaginationResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
}
export interface TaskFilterResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
}
export interface TaskSortResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
}
export interface TaskStatusUpdateResponse {
  task: Task;
}
export interface TaskDueDateUpdateResponse {
  task: Task;
}
export interface TaskCompletionResponse {
  task: Task;
}
export interface TaskAssignmentResponse {
  task: Task;
}
