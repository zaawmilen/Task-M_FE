import React, { useState } from 'react';
import api from '../utils/api';
import UserTasksModal from './UserTasksModal';

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
}

interface UserTableProps {
  users: User[];
  refresh: () => void;
  currentUserId: string;
}

const UserTable: React.FC<UserTableProps> = ({ users, refresh, currentUserId }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);

  const handlePromote = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/promote`);
      refresh();
    } catch (err) {
      console.error('Failed to promote user:', err);
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/demote`);
      refresh();
    } catch (err) {
      console.error('Failed to demote user:', err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        refresh();
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const openTasksModal = (user: User) => {
    setSelectedUser(user);
    setIsTasksModalOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Email</th>
            <th className="py-2 px-4 border-b text-left">Username</th>
            <th className="py-2 px-4 border-b text-left">Role</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.username}</td>
              <td className="py-2 px-4 border-b">
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => openTasksModal(user)}
                  className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
                >
                  View Tasks
                </button>
                {user.role === 'admin' ? (
                  <button
                    onClick={() => handleDemote(user._id)}
                    className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring focus:ring-yellow-400"
                    disabled={user._id === currentUserId}
                  >
                    Demote
                  </button>
                ) : (
                  <button
                    onClick={() => handlePromote(user._id)}
                    className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-400"
                  >
                    Promote
                  </button>
                )}
                <button
                  onClick={() => handleDelete(user._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-400"
                  disabled={user._id === currentUserId}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <UserTasksModal
          userId={selectedUser._id}
          userName={selectedUser.name}
          isOpen={isTasksModalOpen}
          onClose={() => setIsTasksModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserTable;