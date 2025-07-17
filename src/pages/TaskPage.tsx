import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

interface TaskPageProps {
  tasks: Task[] | undefined;
  addTask: (task: { title: string; dueDate: string }) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  loading: boolean;
}

const TaskPage: React.FC<TaskPageProps> = ({
  tasks = [],
  addTask,
  toggleTaskCompletion,
  deleteTask,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  loading,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await addTask({ title: newTaskTitle, dueDate });
      setNewTaskTitle('');
      setDueDate('');
      setSuccessMsg('Task added successfully!');
      setError(null);
    } catch {
      setError('Failed to add task. Please try again.');
    }
  };

  // Handle search input from SearchBar
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  // Filter tasks by both search term and status
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'active' && !task.completed) ||
      (filter === 'completed' && task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Add New Task</h2>
      <form
        onSubmit={handleAddTask}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 flex flex-col gap-4"
      >
        <div>
          <label htmlFor="task-title" className="block mb-1 font-medium">
            Task Title
          </label>
          <input
            id="task-title"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter a new task..."
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <div>
          <label htmlFor="due-date" className="block mb-1 font-medium">
            Due Date
          </label>
          <input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Adding...' : 'Add Task'}
        </button>
        {successMsg && <p className="text-green-600 text-center">{successMsg}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
      </form>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">All Tasks</h2>
        <SearchBar onSearch={handleSearch} />
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`px-3 py-1 rounded ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks found.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div>
                  <span className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => toggleTaskCompletion(task._id)}
                    className={`px-3 py-1 rounded ${task.completed ? 'bg-green-500' : 'bg-yellow-400'} text-white hover:opacity-80 transition`}
                  >
                    {task.completed ? 'Mark Active' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default TaskPage;