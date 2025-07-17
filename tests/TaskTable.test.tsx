// __tests__/TaskTable.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskTable from '../src/components/TaskTable';
import { Task } from '../src/types/task';

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Task One',
    description: 'First task',
    status: 'active',
    completed: false,
    user: {
      _id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      username: 'alice123',
      role: 'user',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Task Two',
    description: 'Second task',
    status: 'completed',
    completed: true,
    user: {
      _id: 'u2',
      name: 'Bob',
      email: 'bob@example.com',
      username: 'bob123',
      role: 'user',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TaskTable Component', () => {
  test('renders all tasks by default', () => {
    render(<TaskTable tasks={mockTasks} />);
    
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });

  test('filters tasks by "Active" status', () => {
    render(<TaskTable tasks={mockTasks} />);

    // Change filter to "active"
    fireEvent.change(screen.getByLabelText(/Filter by status/i), {
      target: { value: 'active' },
    });

    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
  });

  test('filters tasks by "Completed" status', () => {
    render(<TaskTable tasks={mockTasks} />);

    fireEvent.change(screen.getByLabelText(/Filter by status/i), {
      target: { value: 'completed' },
    });

    expect(screen.getByText('Task Two')).toBeInTheDocument();
    expect(screen.queryByText('Task One')).not.toBeInTheDocument();
  });

  test('shows "No tasks found" if filter returns nothing', () => {
    render(<TaskTable tasks={[]} />);

    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });
});
