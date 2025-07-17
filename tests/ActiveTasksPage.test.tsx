// __tests__/ActiveTasksPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveTasksPage from '../src/pages/ActiveTasksPage';
import { Task } from '../src/types/task';

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Active Task 1',
    description: 'Description for task 1',
    completed: false,
    status: 'active',           // must be "active" or "completed"
    user: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Active Task 2',
    description: 'Description for task 2',
    completed: false,
    status: 'active',
    user: 'user2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


describe('ActiveTasksPage', () => {
  it('renders message when no active tasks', () => {
    render(<ActiveTasksPage tasks={[]} toggleTaskCompletion={jest.fn()} />);
    expect(screen.getByText(/No active tasks/i)).toBeInTheDocument();
  });

  it('renders only active tasks', () => {
    render(<ActiveTasksPage tasks={mockTasks} toggleTaskCompletion={jest.fn()} />);
    expect(screen.getByText('Active Task 1')).toBeInTheDocument();
    expect(screen.getByText('Active Task 2')).toBeInTheDocument();
    
  });

  it('calls toggleTaskCompletion when "Mark Complete" clicked', () => {
    const toggleMock = jest.fn();
    render(<ActiveTasksPage tasks={mockTasks} toggleTaskCompletion={toggleMock} />);
    const buttons = screen.getAllByText('Mark Complete');
    fireEvent.click(buttons[0]);
    expect(toggleMock).toHaveBeenCalledWith('1');
  });

  it('renders delete button if deleteTask prop passed and calls deleteTask on click', () => {
    const deleteMock = jest.fn();
    render(<ActiveTasksPage tasks={mockTasks} toggleTaskCompletion={jest.fn()} deleteTask={deleteMock} />);
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBe(2); // only active tasks have delete buttons
    fireEvent.click(deleteButtons[0]);
    expect(deleteMock).toHaveBeenCalledWith('1');
  });
});
