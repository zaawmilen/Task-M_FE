import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../src/components/Register'; // adjust path if needed
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  );
};

describe('Register (Signup) Component', () => {
  test('renders form inputs and submits successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 201 });

    renderWithRouter();

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/register',
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }
      );
    });
  });

  test('shows error message when registration fails', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { message: 'User already exists' } },
    });

    renderWithRouter();

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/user already exists/i)
      ).toBeInTheDocument();
    });
  });
});
