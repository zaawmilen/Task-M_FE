import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskPage from '../src/pages/TaskPage';

describe('TaskPage Component', () => {
  const mockAddTask = jest.fn(() => Promise.resolve());
const mockToggleTask = jest.fn(() => Promise.resolve());
const mockDeleteTask = jest.fn(() => Promise.resolve());


  const sampleTasks = [
    { _id: '1', title: 'Test Task 1', completed: false },
    { _id: '2', title: 'Test Task 2', completed: true },
  ];

  beforeEach(() => {
  mockAddTask.mockClear();
  mockToggleTask.mockClear();
  mockDeleteTask.mockClear();
    
    render(
      <TaskPage
        tasks={sampleTasks}
        addTask={mockAddTask}
        toggleTaskCompletion={mockToggleTask}
        deleteTask={mockDeleteTask}
      />
    );
  });

  it('renders input fields and Add Task button', () => {
    expect(screen.getByTestId('task-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-task-btn')).toBeInTheDocument();
  });

  it('shows tasks in the list', () => {
    const tasks = screen.getByTestId('task-list');
    expect(tasks).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('calls addTask when submitting new task', async () => {
    fireEvent.change(screen.getByTestId('task-input'), {
      target: { value: 'New Task' },
    });
    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: '2025-05-25' },
    });
    fireEvent.click(screen.getByTestId('add-task-btn'));

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'New Task',
        dueDate: '2025-05-25',
      });
    });
  });

  it('calls toggleTaskCompletion when clicking complete button', async () => {
    const completeBtn = screen.getByTestId('complete-task-1');
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockToggleTask).toHaveBeenCalledWith('1');
    });
  });

  it('calls deleteTask when clicking delete button', async () => {
    const deleteBtn = screen.getByTestId('delete-task-2');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('2');
    });
  });

  it('displays error if addTask fails', async () => {
    mockAddTask.mockRejectedValueOnce(new Error('Failed'));

    fireEvent.change(screen.getByTestId('task-input'), {
      target: { value: 'Error Task' },
    });
    fireEvent.change(screen.getByTestId('date-input'), {
      target: { value: '2025-05-25' },
    });
    fireEvent.click(screen.getByTestId('add-task-btn'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to add task. Please try again.');
  });
});
