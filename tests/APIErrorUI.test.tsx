import { render, screen, waitFor } from '@testing-library/react';
import TaskPage from '../src/pages/TaskPage';
// import { http, HttpResponse } from 'msw';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock server response with a 500 error
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
  })
);

// Mock props
const mockTasks = [];
const mockAddTask = jest.fn();
const mockToggleTaskCompletion = jest.fn();
const mockDeleteTask = jest.fn();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays error message on API failure', async () => {
  render(
    <TaskPage
      tasks={mockTasks}
      addTask={mockAddTask}
      toggleTaskCompletion={mockToggleTaskCompletion}
      deleteTask={mockDeleteTask}
    />
  );

  await waitFor(() => {
    expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
  });
});
