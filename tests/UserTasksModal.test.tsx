import React from 'react';
import { render, screen, fireEvent,waitFor  } from '@testing-library/react';
import UserTasksModal from '../src/components/UserTasksModal';
import { Task } from '../src/types/task';
import api from '../src/utils/api';

// Mock API
jest.mock('../src/utils/api');

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      _id: 'user1',
      name: 'John',
      email: 'john@example.com',
      username: 'john_doe',
      role: 'user'
    },
  },
];

describe('UserTasksModal', () => {
  const defaultProps = {
    userId: 'user1',
    userName: 'John Doe',
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<UserTasksModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render loading state and then show tasks', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<UserTasksModal {...defaultProps} />);

    expect(screen.getByText(/Loading tasks/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Test Task/i)).toBeInTheDocument();
    });
  });

  it('should show error on fetch failure', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<UserTasksModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch tasks/i)).toBeInTheDocument();
    });
  });

  it('should close modal on ✕ button click', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<UserTasksModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/Test Task/));

    fireEvent.click(screen.getByText('✕'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should filter tasks by status', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockTasks });

    render(<UserTasksModal {...defaultProps} />);
    await waitFor(() => screen.getByText(/Test Task/));

    const select = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(select, { target: { value: 'completed' } });

    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });
});
