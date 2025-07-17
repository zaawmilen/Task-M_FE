import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserTable from '../src/components/UserTable';
import api from '../src/utils/api';

jest.mock('../src/utils/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock UserTasksModal to just render a placeholder div
jest.mock('../src/components/UserTasksModal', () => (props: any) => {
  return props.isOpen ? <div data-testid="tasks-modal">Tasks Modal for {props.userName}</div> : null;
});

describe('UserTable Component', () => {
  const users = [
    {
      _id: '1',
      name: 'Alice',
      email: 'alice@example.com',
      username: 'alice',
      role: 'user',
    },
    {
      _id: '2',
      name: 'Bob',
      email: 'bob@example.com',
      username: 'bob',
      role: 'admin',
    },
  ];
  const currentUserId = '2';
  const refresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user data and roles correctly', () => {
    render(<UserTable users={users} refresh={refresh} currentUserId={currentUserId} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();

    // Role badge colors (classnames)
    const adminBadge = screen.getByText('admin');
    expect(adminBadge).toHaveClass('bg-red-100');
    const userBadge = screen.getByText('user');
    expect(userBadge).toHaveClass('bg-blue-100');
  });

  test('promote calls API and triggers refresh', async () => {
    mockedApi.put.mockResolvedValueOnce({});

    render(<UserTable users={users} refresh={refresh} currentUserId={currentUserId} />);
    const promoteButton = screen.getByRole('button', { name: /promote/i });
    fireEvent.click(promoteButton);

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith('/admin/users/1/promote');
      expect(refresh).toHaveBeenCalled();
    });
  });

  test('demote calls API and triggers refresh, disables current user demote button', async () => {
    mockedApi.put.mockResolvedValueOnce({});

    render(<UserTable users={users} refresh={refresh} currentUserId={currentUserId} />);
    const demoteButtons = screen.getAllByRole('button', { name: /demote/i });
    expect(demoteButtons.length).toBe(1);

    // Current user demote button is disabled
    const demoteButton = demoteButtons[0];
    expect(demoteButton).toBeDisabled();

    // Now test demote for a non-current user admin (let's add one)
    const testUsers = [
      ...users,
      {
        _id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
        username: 'charlie',
        role: 'admin',
      },
    ];
    render(<UserTable users={testUsers} refresh={refresh} currentUserId={currentUserId} />);

    // Find demote button for Charlie, should NOT be disabled
    const buttons = screen.getAllByRole('button', { name: /demote/i });
   const charlieDemoteButton = buttons.find(btn => (btn as HTMLButtonElement).disabled === false) as HTMLButtonElement | undefined;

    expect(charlieDemoteButton).toBeTruthy();

    fireEvent.click(charlieDemoteButton!);
    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith('/admin/users/3/demote');
      expect(refresh).toHaveBeenCalled();
    });
  });

  test('delete confirms and calls API, disables delete for current user', async () => {
    mockedApi.delete.mockResolvedValueOnce({});

    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(<UserTable users={users} refresh={refresh} currentUserId={currentUserId} />);

    // Delete button for Alice (not current user)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBe(2);

    const aliceDeleteBtn = deleteButtons.find(btn => !(btn as HTMLButtonElement).disabled) as HTMLButtonElement | undefined;
    expect(aliceDeleteBtn).toBeTruthy();

    fireEvent.click(aliceDeleteBtn!);
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
      expect(mockedApi.delete).toHaveBeenCalledWith('/admin/users/1');
      expect(refresh).toHaveBeenCalled();
    });

    // Delete button for current user (Bob) is disabled
    const bobDeleteBtn = deleteButtons.find(btn => (btn as HTMLButtonElement).disabled) as HTMLButtonElement | undefined;
    expect(bobDeleteBtn).toBeTruthy();
  });

  test('clicking View Tasks opens the modal', () => {
    render(<UserTable users={users} refresh={refresh} currentUserId={currentUserId} />);

    const viewTasksButtons = screen.getAllByRole('button', { name: /view tasks/i });
    fireEvent.click(viewTasksButtons[0]); // for Alice

    expect(screen.getByTestId('tasks-modal')).toHaveTextContent('Tasks Modal for Alice');
  });
});
