import { render, screen } from '@testing-library/react';
import TaskList from './TaskList';
import { Task } from '../types/type';

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Test Task',
    description: 'desc',
    status: 'active',
    dueDate: '2025-01-01',
    user: 'user1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    completed: false,
  },
];

test('renders Task List heading', () => {
  render(
    <TaskList
      tasks={mockTasks}
      toggleTaskCompletion={() => {}}
      deleteTask={() => {}}
      loading={false}
    />
  );
  expect(screen.getByText(/task list/i)).toBeInTheDocument();
});
