import { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, ChevronDown, Check, Shield, UserCog, User as UserIcon } from 'lucide-react';
import { InviteUserModal } from '../../components/modals/InviteUserModal';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { useToast } from '../../components/ui/Toast';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  isInvite?: boolean;
  factory: { name: string };
}

const RoleDropdown = ({ currentRole, onSelect }: { currentRole: string, onSelect: (role: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roles = [
    { value: 'ORG_ADMIN', label: 'Org Admin', icon: <Shield size={14} className="text-purple-400" /> },
    { value: 'FACTORY_MANAGER', label: 'Manager', icon: <UserCog size={14} className="text-blue-400" /> },
    { value: 'WORKER', label: 'Worker', icon: <UserIcon size={14} className="text-gray-400" /> },
  ];

  const activeRole = roles.find(r => r.value === currentRole) || roles[1];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-xs font-medium text-gray-200 transition-colors w-40 justify-between"
      >
        <div className="flex items-center gap-2">
          {activeRole.icon}
          {activeRole.label}
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-40 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => { onSelect(role.value); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-2 text-gray-300 group-hover:text-white">
                  {role.icon}
                  {role.label}
                </div>
                {currentRole === role.value && <Check size={14} className="text-green-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    APPROVED: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]',
    INVITED: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]',
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };
  const style = styles[status as keyof typeof styles] || styles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${style}`}>
      {status === 'INVITED' && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
};


export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<{id: string, isInvite: boolean} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  const handleRequestDelete = (id: string, isInvite: boolean = false) => {
    setDeleteTarget({ id, isInvite });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      await apiClient.delete(`/users/${deleteTarget.id}?type=${deleteTarget.isInvite ? 'invite' : 'user'}`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      showToast('User removed successfully', 'success');
      setDeleteTarget(null);
    } catch (error) {
      showToast('Failed to remove user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    const previousUsers = [...users];
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    
    try {
      await apiClient.patch(`/users/${id}/role`, { role: newRole });
      showToast(`Role updated to ${newRole.replace('_', ' ')}`, 'success');
    } catch (error) {
      setUsers(previousUsers);
      showToast('Failed to update role', 'error');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            <UserPlus size={18} />
            Invite User
          </motion.button>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading users...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                <tr>
                  <th className="p-5 border-b border-white/5">Email</th>
                  <th className="p-5 border-b border-white/5">Role</th>
                  <th className="p-5 border-b border-white/5">Factory</th>
                  <th className="p-5 border-b border-white/5">Status</th>
                  <th className="p-5 border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5">
                      <div className="font-medium text-white">{user.email}</div>
                    </td>
                    
                    <td className="p-5">
                      {!user.isInvite ? (
                        <RoleDropdown currentRole={user.role} onSelect={(r) => handleRoleChange(user.id, r)} />
                      ) : (
                        <span className="text-gray-500 text-xs italic">Invitation Sent</span>
                      )}
                    </td>

                    <td className="p-5 text-gray-300 text-sm">{user.factory.name}</td>
                    
                    <td className="p-5">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="p-5 text-right">
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRequestDelete(user.id, user.isInvite)}
                        className="p-2 text-gray-500 rounded-lg transition-colors"
                        title="Remove User"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
          
          {users.length === 0 && !isLoading && (
              <div className="p-12 text-center text-gray-500 border-t border-white/5">No users found. Start by inviting someone.</div>
          )}
        </div>
      </motion.div>

      <InviteUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserInvited={() => {
            fetchUsers();
            showToast('Invitation sent successfully!', 'success');
        }} 
      />
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Remove User"
        message="Are you sure you want to remove this user from the organization? They will lose access immediately. This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
};