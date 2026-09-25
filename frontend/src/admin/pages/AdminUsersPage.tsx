import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus } from 'lucide-react';
import { adminUsersApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';

export const AdminUsersPage: React.FC = () => {
  const toast = useAdminToast();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Styled Confirmation Modal State
  const [statusTarget, setStatusTarget] = useState<{ id: string; name: string; active: boolean } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'ADMIN',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminUsersApi.list();
      if (res.success) setUsers(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch admin users', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleConfirmToggle = async () => {
    if (!statusTarget) return;
    setIsToggling(true);
    try {
      await adminUsersApi.toggleStatus(statusTarget.id);
      const action = statusTarget.active ? 'deactivated' : 'reactivated';
      toast.info('Account status updated', `Administrator "${statusTarget.name}" has been ${action}.`);
      setStatusTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to modify account status', err.message);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminUsersApi.create(formData);
      toast.success('Admin user created', `New administrator "${formData.name}" added.`);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error('Failed to create admin user', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vexo-red" />
            <span>Administrator Directory & Role-Based Access</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Only Super Administrators can create or deactivate accounts</p>
        </div>

        <button
          onClick={() => {
            setFormData({ email: '', name: '', password: '', role: 'ADMIN' });
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      <div className="w-full max-w-full min-w-0 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-400 dark:text-zinc-500">LOADING USERS...</div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#121218] border-b border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[200px]">Admin Name & Email</th>
                  <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[120px]">Role</th>
                  <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[120px]">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[150px]">Last Login</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap min-w-[110px]">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold font-mono text-xs flex items-center justify-center text-slate-900 dark:text-white">
                          {user.name?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300'
                            : user.role === 'ADMIN'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never logged in'}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      {user.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => setStatusTarget({ id: user.id, name: user.name, active: user.isActive })}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            user.isActive
                              ? 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Administrative Account"
        subtitle="Provision a team administrator with full control capabilities"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">FULL NAME *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">EMAIL ADDRESS *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="maya@vexomusic.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">TEMPORARY PASSWORD *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">ROLE PRIVILEGES</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none cursor-pointer"
            >
              <option value="ADMIN">ADMIN — Full CMS Access (Artists, Music, Events, Videos, Inquiries)</option>
              <option value="EDITOR">EDITOR — Content Authoring Only</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN — Full Access + Governance & Security</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white cursor-pointer transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Provision Admin Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Styled Status Toggle Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(statusTarget)}
        title={statusTarget?.active ? 'Deactivate Administrator' : 'Reactivate Administrator'}
        itemName={statusTarget?.name}
        message={
          statusTarget?.active
            ? `Are you sure you want to deactivate administrator "${statusTarget?.name}"? They will be immediately locked out from the admin panel.`
            : `Are you sure you want to reactivate administrator "${statusTarget?.name}"? Their administrative privileges will be restored.`
        }
        confirmText={statusTarget?.active ? 'Deactivate Account' : 'Reactivate Account'}
        isDanger={statusTarget?.active}
        isLoading={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
};
