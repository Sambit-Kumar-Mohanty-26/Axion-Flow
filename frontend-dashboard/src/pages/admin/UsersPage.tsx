import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { InviteUserModal } from '../../components/modals/InviteUserModal';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  factory: {
    name: string;
  };
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-500/20 text-green-400';
    case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
    case 'REJECTED': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setError("Could not load user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={20} />
            Invite User
          </button>
        </div>

        <div className="bg-gray-800/50 border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <p className="p-6 text-center text-gray-400">Loading users...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-400">{error}</p>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-white/10 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Factory</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="p-4 text-white font-medium">{user.email}</td>
                    <td className="p-4 text-gray-300">{user.role.replace('_', ' ')}</td>
                    <td className="p-4 text-gray-300">{user.factory.name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <InviteUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserInvited={fetchUsers} 
      />
    </>
  );
};