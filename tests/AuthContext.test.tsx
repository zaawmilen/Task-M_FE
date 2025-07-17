// src/__tests__/AuthContext.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ✅ Dummy child component to access AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <p>User: {user.email}</p>
          <p>Authenticated: {isAuthenticated ? 'yes' : 'no'}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>No user</p>
      )}
    </div>
  );
};

// ✅ Reusable render function
const renderWithProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  
  test('loads user if token exists and axios returns data', async () => {
    const mockUser = { userId: '1', email: 'test@example.com', role: 'user' };
    localStorage.setItem('token', 'valid-token');
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText(/user: test@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/authenticated: yes/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  test('removes token and shows no user if axios fails', async () => {
    localStorage.setItem('token', 'invalid-token');
    mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText(/no user/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  test('logout clears user and token', async () => {
    const mockUser = { userId: '1', email: 'test@example.com', role: 'user' };
    localStorage.setItem('token', 'valid-token');
    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    renderWithProvider();

    await waitFor(() => screen.getByText(/user: test@example.com/i));

    userEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByText(/no user/i)).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  test('shows no user if no token is present', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByText(/no user/i)).toBeInTheDocument();
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
