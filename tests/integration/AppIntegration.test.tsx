import { render, screen } from '@testing-library/react';
import App from '../../src/App';




test('renders the main app component', () => {
  render(<App />);
  // Adjust the text below to something you know appears on your main page
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
});
// Example for AppIntegration.test.tsx
it('redirects unauthenticated users from /tasks', () => {
  window.history.pushState({}, '', '/tasks');
  render(<App />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});

it('redirects authenticated users from /login', () => {
  localStorage.setItem('token', 'abc');
  // Mock user context/provider as authenticated
  render(<App />);
  window.history.pushState({}, '', '/login');
  expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
});