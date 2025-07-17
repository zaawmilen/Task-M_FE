import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import TaskList from '../src/components/TaskList';
import Login from '../src/components/Login';
import React from 'react';

// Mocks for TaskList component props
const mockTasks = [];
const mockToggleTaskCompletion = jest.fn();
const mockDeleteTask = jest.fn();
const mockLoading = false;

describe('ProtectedRoute', () => {
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects unauthenticated user to login page', async () => {
    // Simulate unauthenticated user
    localStorage.removeItem('token');

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route
            path="/tasks"
            element={
              <ProtectedRoute isAuthenticated={false}>
                <TaskList
                  tasks={mockTasks}
                  toggleTaskCompletion={mockToggleTaskCompletion}
                  deleteTask={mockDeleteTask}
                  loading={mockLoading}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<Login setUser={jest.fn()} onLogin={jest.fn()} />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });

  test('renders child component when authenticated', async () => {
    // Simulate authenticated user
    localStorage.setItem('token', 'mock-token');

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route
            path="/tasks"
            element={
              <ProtectedRoute isAuthenticated={true}>
                <TaskList
                  tasks={mockTasks}
                  toggleTaskCompletion={mockToggleTaskCompletion}
                  deleteTask={mockDeleteTask}
                  loading={mockLoading}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });
  });
});
