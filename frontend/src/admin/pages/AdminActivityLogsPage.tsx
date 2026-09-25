import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { adminActivityLogsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';

export const AdminActivityLogsPage: React.FC = () => {
  const toast = useAdminToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await adminActivityLogsApi.list(100);
      if (res.success) setLogs(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch audit logs', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.adminUserName?.toLowerCase().includes(q) ||
      log.ipAddress?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Filter Bar */}
      <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by action, entity, or admin user..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-400 dark:text-zinc-500">FETCHING AUDIT TRAIL...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 dark:text-zinc-500">No activity logs recorded.</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#121218] border-b border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action Triggered</th>
                  <th className="py-3.5 px-6">Entity Target</th>
                  <th className="py-3.5 px-6">Administrator</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-transparent text-[10px] font-mono">
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">
                        {log.adminUserName || 'System / Automated'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent dark:text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer"
                        >
                          Inspect Payload
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload: ${selectedLog.action}`}
          subtitle={`Triggered on ${new Date(selectedLog.createdAt).toLocaleString()} by ${selectedLog.adminUserName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 scrollbar-thin">
              <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-white"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
