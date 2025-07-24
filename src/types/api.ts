
import { Task } from './task';

export interface TaskListResponse {
  tasks: Task[];
  page: number;
  totalPages: number;
}

export interface SingleTaskResponse {
  task: Task;
}
