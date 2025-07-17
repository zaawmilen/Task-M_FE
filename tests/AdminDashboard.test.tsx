import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminDashboard from '../src/pages/AdminDashboard';
import api from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';
import '@testing-library/jest-dom';

// Mock components
jest.mock('../src/components/UserTable', () => () => <div data-testid="user-table">Mocked UserTable</div>);
jest.mock('../src/components/TaskTable', () => () => <div data-testid="task-table">Mocked TaskTable</div>);

// Mock useAuth
jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock API
jest.mock('../src/utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: 'admin1', role: 'admin' },
    });

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/admin/users') {
        return Promise.resolve({
          data: [
            { _id: '1', name: 'John' },
            { _id: '2', name: 'Jane' },
          ],
        });
      }
      if (url === '/admin/tasks') {
        return Promise.resolve({
          data: [
            { _id: 't1', title: 'Sample Task', description: 'Test description' }
          ],
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('renders AdminDashboard with users tab by default', async () => {
    render(<AdminDashboard />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('All Tasks')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
    });
  });

  test('switches to tasks tab and displays TaskTable', async () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('All Tasks'));

    await waitFor(() => {
      expect(screen.getByTestId('task-table')).toBeInTheDocument();
    });
  });

  test('shows loading message if user is not yet available', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<AdminDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows error message when fetching tasks fails', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { userId: 'admin1', role: 'admin' },
    });

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/admin/users') {
        return Promise.resolve({ data: [{ _id: '1', name: 'John' }] });
      }
      if (url === '/admin/tasks') {
        return Promise.reject({
          response: { data: 'Internal Server Error', status: 500 },
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('All Tasks'));

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching tasks', async () => {
    let resolveFetch: any;
    const fetchPromise = new Promise((res) => (resolveFetch = res));

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/admin/users') {
        return Promise.resolve({ data: [{ _id: '1', name: 'John' }] });
      }
      if (url === '/admin/tasks') {
        return fetchPromise;
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('All Tasks'));

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();

    resolveFetch({ data: [{ _id: '1', title: 'Delayed Task' }] });

    await waitFor(() => {
      expect(screen.getByTestId('task-table')).toBeInTheDocument();
    });
  });

  test('clicking Refresh Tasks calls fetchAllTasks again', async () => {
    const mockGet = jest.fn((url: string) => {
      if (url === '/admin/users') return Promise.resolve({ data: [] });
      if (url === '/admin/tasks') return Promise.resolve({ data: [{ _id: 't1', title: 'Sample Task' }] });
      return Promise.reject(new Error('Unknown endpoint'));
    });

    (api.get as jest.Mock).mockImplementation(mockGet);

    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('All Tasks'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/admin/tasks');
    });

    fireEvent.click(screen.getByText(/Refresh Tasks/i));

    await waitFor(() => {
      expect(mockGet.mock.calls.filter(call => call[0] === '/admin/tasks').length).toBe(2);
    });
  });

  test('applies active style to selected tab', async () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByText('All Tasks'));

    await waitFor(() => {
      const tasksTab = screen.getByText('All Tasks');
      expect(tasksTab).toHaveClass('border-b-2', 'border-blue-500', 'text-blue-500', 'font-medium');
    });
  });

  test('redirects or restricts access for non-admin users', async () => {
  (useAuth as jest.Mock).mockReturnValue({
    user: { userId: 'user1', role: 'user' },
  });

  render(<AdminDashboard />);
  
  // Check for access denied message
  expect(screen.getByText('Access Denied')).toBeInTheDocument();
  
  // Verify admin-specific content is not shown
  expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
});
});