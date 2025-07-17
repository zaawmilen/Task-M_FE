import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthFlow', () => {
  beforeEach(() => {
    // Simulate login token
    localStorage.setItem('token', 'mocked-token');

    // Mock GET /api/auth/me response
    mockedAxios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/me') {
        return Promise.resolve({
          data: {
            user: {
              _id: '123',
              username: 'testuser',
              role: 'user'
            }
          }
        });
      }

      if (url === 'http://localhost:5000/api/tasks') {
        return Promise.resolve({
          data: {
            tasks: [],
            totalPages: 1,
            page: 1
          }
        });
      }

      return Promise.reject(new Error('Unknown API route'));
    });
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects authenticated user to dashboard', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  test('logout clears token and redirects to login', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
test('unauthenticated user is redirected to login', async () => {
    localStorage.removeItem('token');
    mockedAxios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/auth/me') {
        return Promise.reject({ response: { status: 401 } });
      }
      return Promise.reject(new Error('Unknown API route'));
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });
  });