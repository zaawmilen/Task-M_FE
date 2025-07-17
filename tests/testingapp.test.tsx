import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a properly typed localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(store).length;
    },
    store,
  };
})();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

describe('App.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.store = {};
  });

  test('shows loading indicator initially', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders login and register links when not authenticated', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
    });
  });

  test('renders navigation links and welcome message when authenticated', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'johndoe', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/welcome, johndoe/i)).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });
  });

  test('renders admin panel link if user is admin', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'adminuser', role: 'admin' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /admin panel/i })).toBeInTheDocument();
    });
  });

  test('logout clears user and localStorage', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'johndoe', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/welcome, johndoe/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });

  test('redirects logged-in user away from login page', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'johndoe', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /login/i })).not.toBeInTheDocument();
      expect(screen.getByText(/welcome, johndoe/i)).toBeInTheDocument();
    });
  });

  test('redirects unauthenticated user from protected route', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    mockedAxios.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });

  test('allows authenticated user to access /tasks page', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'user1', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/welcome, user1/i)).toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'user1', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({ data: { tasks: [], totalPages: 1, page: 1 } });
    mockedAxios.post.mockResolvedValueOnce({ data: { title: 'New Task' } });

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/welcome, user1/i));
    
    fireEvent.change(screen.getByPlaceholderText(/enter new task/i), {
      target: { value: 'New Task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        { title: 'New Task' }
      );
    });
  });

  test('updates a task', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'user1', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        tasks: [{ id: '1', title: 'Old Task', completed: false }],
        totalPages: 1,
        page: 1,
      },
    });
    mockedAxios.put.mockResolvedValueOnce({ data: { id: '1', title: 'Updated Task' } });

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/old task/i));

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.change(screen.getByDisplayValue(/old task/i), {
      target: { value: 'Updated Task' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1'),
        { title: 'Updated Task' }
      );
    });
  });

  test('deletes a task', async () => {
    (localStorageMock.getItem as jest.Mock).mockReturnValue('token123');
    mockedAxios.get.mockResolvedValueOnce({ data: { username: 'user1', role: 'user' } });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        tasks: [{ id: '1', title: 'Task to delete', completed: false }],
        totalPages: 1,
        page: 1,
      },
    });
    mockedAxios.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/task to delete/i));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1')
      );
    });
  });
});