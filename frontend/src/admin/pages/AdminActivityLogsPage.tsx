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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by action, entity, or admin user..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e0e13] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-zinc-500">FETCHING AUDIT TRAIL...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500">No activity logs recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action Triggered</th>
                  <th className="py-3.5 px-6">Entity Target</th>
                  <th className="py-3.5 px-6">Administrator</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
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
                      <span className="font-mono font-bold text-xs text-white">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-zinc-200">
                        {log.adminUserName || 'System / Automated'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-[10px] text-zinc-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 transition-colors cursor-pointer"
                        >
                          Inspect Payload
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-600">—</span>
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
