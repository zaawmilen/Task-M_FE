import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompletedTasksPage from '../src/pages/CompletedTasksPage';
import { Task } from '../src/types/task';
const mockTasks : Task[] =[
  {
    _id: '1',
    title: 'Task 1',
    description: 'Description 1',
    completed: true,
    status: 'completed',   // <-- Use literal "completed" or "active"
    user: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Task 2',
    description: 'Description 2',
    completed: true,
    status: 'completed',   // <-- Must be "active" or "completed"
    user: 'user2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


describe('CompletedTasksPage', () => {
  const toggleMock = jest.fn();
  const deleteMock = jest.fn(async (id: string) => Promise.resolve());

  it('renders message when no completed tasks', () => {
    render(
      <CompletedTasksPage
        tasks={[]}
        toggleTaskCompletion={toggleMock}
        deleteTask={deleteMock}
      />
    );
    expect(screen.getByText(/No completed tasks/i)).toBeInTheDocument();
  });

  it('renders only completed tasks', () => {
    render(
      <CompletedTasksPage
        tasks={mockTasks}
        toggleTaskCompletion={toggleMock}
        deleteTask={deleteMock}
      />
    );
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('calls toggleTaskCompletion when "Mark Incomplete" clicked', () => {
    render(
      <CompletedTasksPage
        tasks={mockTasks}
        toggleTaskCompletion={toggleMock}
        deleteTask={deleteMock}
      />
    );
    const buttons = screen.getAllByText(/Mark Active/i);
    fireEvent.click(buttons[0]);
    expect(toggleMock).toHaveBeenCalledWith('1');
  });

  it('calls deleteTask when delete button clicked', () => {
    render(
      <CompletedTasksPage
        tasks={mockTasks}
        toggleTaskCompletion={toggleMock}
        deleteTask={deleteMock}
      />
    );
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(deleteMock).toHaveBeenCalledWith('1');
  });
});
