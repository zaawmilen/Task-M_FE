import React, { useState } from 'react';
import { Task } from '../types/type';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';

interface ActiveTasksPageProps {
  tasks: Task[];
  toggleTaskCompletion: (id: string) => Promise<void>;
  deleteTask?: (id: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearch: (term: string) => void;
  loading: boolean;
}

const TASKS_PER_PAGE = 5;

const ActiveTasksPage: React.FC<ActiveTasksPageProps> = ({
  tasks,
  toggleTaskCompletion,
  deleteTask,
  currentPage,
  onPageChange,
  onSearch,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );
  const localTotalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      
      {/* Heading + Search Bar Side by Side */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
          Active Tasks
        </h2>
        <div className="w-full md:w-1/2">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-center text-gray-500">No active tasks. Add a new task on the home page.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {paginatedTasks.map((task) => (
              <li
                key={task._id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-100">{task.title}</span>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => toggleTaskCompletion(task._id)}
                    className="px-3 py-1 rounded bg-yellow-400 text-white hover:opacity-80 transition"
                  >
                    Mark Complete
                  </button>
                  {deleteTask && (
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={localTotalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default ActiveTasksPage;
