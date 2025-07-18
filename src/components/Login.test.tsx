import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const onLogin = jest.fn();
  const setUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login onLogin={onLogin} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('updates input fields', () => {
    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('password123');
  });

  it('handles successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: 'fake-token', user: { email: 'test@example.com' } },
    });

    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('fake-token', { email: 'test@example.com' });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
// Example for Login.test.tsx
it('logs in with valid credentials and redirects', async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: { token: 'abc', user: { email: 'test@test.com' } } });
  render(<Login onLogin={onLogin} />);
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  await waitFor(() => expect(onLogin).toHaveBeenCalled());
  
});

it('shows error on invalid credentials', async () => {
  mockedAxios.post.mockRejectedValueOnce({ 
    response: { data: { message: 'Invalid credentials' } } 
  });
  
  render(<Login onLogin={onLogin}  />);
  
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@test.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Wait for the error message to appear
  await waitFor(() => {
    const errorElement = screen.getByRole('alert'); // or screen.getByText(/invalid credentials/i);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.textContent).toMatch(/invalid credentials/i);
  });
});
  it('shows error on failed login', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<Login onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});