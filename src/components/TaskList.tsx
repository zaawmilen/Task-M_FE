import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  toggleTaskCompletion: (id: string) => void;
  deleteTask: (id: string) => void;
  loading: boolean;
}

const TaskList = ({ tasks, toggleTaskCompletion, deleteTask, loading }: TaskListProps) => (
  <div data-testid="task-list" className="max-w-2xl mx-auto px-4 py-6">
    <h2 className="text-xl font-bold mb-4 text-blue-700 text-center">Task List</h2>
    {loading ? (
      <p className="text-center text-gray-500">Loading...</p>
    ) : (
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task._id}
            className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-lg shadow p-4"
          >
            <span className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.title}
            </span>
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
                aria-label="Delete Task"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default TaskList;