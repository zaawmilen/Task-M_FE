
import { Task } from './type';

export interface TaskListResponse {
  tasks: Task[];
  page: number;
  totalPages: number;
}

export interface SingleTaskResponse {
  task: Task;
}
