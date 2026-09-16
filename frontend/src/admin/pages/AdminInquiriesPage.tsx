import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  Phone,
  Building2,
  ExternalLink,
  Eye,
  Check,
  Inbox,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { adminInquiriesApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface ContactEnquiry {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  message: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const AdminInquiriesPage: React.FC = () => {
  const toast = useAdminToast();
  const [inquiries, setInquiries] = useState<ContactEnquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Styled Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; refId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<ContactEnquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const res = await adminInquiriesApi.list({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
      });
      if (res.success && res.data) {
        setInquiries(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to fetch inquiries', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  // Real-time client-side filter
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        inq.referenceId?.toLowerCase().includes(q) ||
        inq.name?.toLowerCase().includes(q) ||
        inq.email?.toLowerCase().includes(q) ||
        inq.phone?.toLowerCase().includes(q) ||
        inq.company?.toLowerCase().includes(q) ||
        inq.service?.toLowerCase().includes(q) ||
        inq.message?.toLowerCase().includes(q)
      );
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === 'NEW').length;
    const contactedCount = inquiries.filter((i) => i.status === 'CONTACTED').length;
    const closedCount = inquiries.filter((i) => i.status === 'CLOSED').length;
    return { total, newCount, contactedCount, closedCount };
  }, [inquiries]);

  const handleOpenDetail = (inq: ContactEnquiry) => {
    setSelectedInquiry(inq);
    setAdminNotes(inq.notes || '');
  };

  const handleUpdateStatus = async (inquiryId: string, status: EnquiryStatus, customNotes?: string) => {
    try {
      setIsUpdating(true);
      const notesToSave = customNotes !== undefined ? customNotes : (selectedInquiry?.id === inquiryId ? adminNotes : undefined);
      const res = await adminInquiriesApi.updateStatus(inquiryId, status, notesToSave);
      if (res.success) {
        // Update local list state
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? { ...item, status, notes: notesToSave ?? item.notes } : item))
        );
        if (selectedInquiry && selectedInquiry.id === inquiryId) {
          setSelectedInquiry({ ...selectedInquiry, status, notes: notesToSave ?? selectedInquiry.notes });
        }
        toast.success('Status updated', `Enquiry marked as ${status}.`);
      }
    } catch (err: any) {
      toast.error('Status update failed', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsUpdating(true);
      const res = await adminInquiriesApi.updateStatus(selectedInquiry.id, selectedInquiry.status, adminNotes);
      if (res.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? { ...item, notes: adminNotes } : item))
        );
        setSelectedInquiry({ ...selectedInquiry, notes: adminNotes });
        toast.success('Notes saved', 'Internal production note updated.');
      }
    } catch (err: any) {
      toast.error('Failed to save notes', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminInquiriesApi.delete(deleteTarget.id);
      setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      if (selectedInquiry?.id === deleteTarget.id) setSelectedInquiry(null);
      toast.info('Enquiry removed', `Submission #${deleteTarget.refId} has been deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusTabs = [
    { label: 'ALL ENQUIRIES', value: 'ALL', count: metrics.total },
    { label: 'NEW', value: 'NEW', count: metrics.newCount, isHighlight: true },
    { label: 'CONTACTED', value: 'CONTACTED', count: metrics.contactedCount },
    { label: 'CLOSED', value: 'CLOSED', count: metrics.closedCount },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide uppercase flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-vexo-red" />
            <span>Contact Request Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Review incoming artist bookings, corporate inquiries, production requests, and triage workflows.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          title="Refresh List"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-vexo-red' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">TOTAL REQUESTS</span>
            <Inbox className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{metrics.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e0e13] border border-red-200 dark:border-red-900/40 bg-gradient-to-br from-red-50/50 dark:from-red-950/20 to-transparent space-y-1 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between text-vexo-red dark:text-red-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">NEW SUBMISSIONS</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vexo-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vexo-red" />
            </span>
          </div>
          <p className="text-2xl font-black font-mono text-vexo-red">{metrics.newCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e0e13] border border-sky-200 dark:border-sky-900/30 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">CONTACTED</span>
            <PhoneCall className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">{metrics.contactedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">CLOSED / RESOLVED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{metrics.closedCount}</p>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-vexo-red text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800/40'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-black/40 text-white'
                      : tab.isHighlight && tab.count > 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, service, company, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* 3. Enquiries Table */}
      <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-400 dark:text-zinc-500 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
            <span>FETCHING CONTACT REQUESTS...</span>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Mail className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-300">No contact requests found</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              {searchQuery ? 'Try clearing your search query.' : 'Incoming submissions from the contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#121218] border-b border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                <tr>
                  <th className="py-3.5 px-6">Name & Company</th>
                  <th className="py-3.5 px-6">Email & Phone</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filteredInquiries.map((inq) => {
                  const isNew = inq.status === 'NEW';
                  const isContacted = inq.status === 'CONTACTED';

                  return (
                    <tr
                      key={inq.id}
                      onClick={() => handleOpenDetail(inq)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer ${
                        isNew ? 'bg-red-50/60 dark:bg-red-950/10' : ''
                      }`}
                    >
                      {/* Name & Reference ID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-vexo-red text-[11px]">
                            {inq.referenceId}
                          </span>
                          {isNew && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{inq.name}</p>
                        {inq.company && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                            <span>{inq.company}</span>
                          </p>
                        )}
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-6">
                        <a
                          href={`mailto:${inq.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-slate-800 dark:text-zinc-200 hover:text-vexo-red transition-colors block"
                        >
                          {inq.email}
                        </a>
                        {inq.phone && (
                          <a
                            href={`tel:${inq.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{inq.phone}</span>
                          </a>
                        )}
                      </td>

                      {/* Service */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono font-medium text-slate-700 dark:text-zinc-300">
                          {inq.service}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                          <span>
                            {new Date(inq.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                          {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                            isNew
                              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-300'
                              : isContacted
                              ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isNew
                                ? 'bg-vexo-red animate-pulse'
                                : isContacted
                                ? 'bg-sky-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{inq.status}</span>
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Mark as Contacted */}
                          {inq.status === 'NEW' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(inq.id, 'CONTACTED')}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 dark:border-sky-800/60 dark:text-sky-300 text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Mark as Contacted"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Contacted</span>
                            </button>
                          )}

                          {/* 1-Click Mark as Closed */}
                          {inq.status !== 'CLOSED' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(inq.id, 'CLOSED')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:border-emerald-800/60 dark:text-emerald-300 text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Mark as Closed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Close</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(inq)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-950 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 dark:hover:text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="View Full Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: inq.id, refId: inq.referenceId })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/60 dark:border-red-900/40 dark:text-red-400 dark:hover:text-red-200 transition-colors cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Full Detail Dossier Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Enquiry Dossier: ${selectedInquiry.referenceId}`}
          subtitle={`Submitted by ${selectedInquiry.name} on ${new Date(selectedInquiry.createdAt).toLocaleString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Contact Info Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">FULL NAME</p>
                <p className="font-bold text-white text-sm mt-0.5">{selectedInquiry.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">EMAIL ADDRESS</p>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-mono font-semibold text-vexo-red-bright hover:underline mt-0.5 block flex items-center gap-1"
                >
                  <span>{selectedInquiry.email}</span>
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">PHONE NUMBER</p>
                {selectedInquiry.phone ? (
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-mono font-semibold text-zinc-200 hover:text-white mt-0.5 block flex items-center gap-1"
                  >
                    <span>{selectedInquiry.phone}</span>
                    <Phone className="w-3 h-3 inline text-zinc-400" />
                  </a>
                ) : (
                  <p className="font-mono text-zinc-500 mt-0.5">Not provided</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">COMPANY / RECORD LABEL</p>
                <p className="font-semibold text-white mt-0.5">{selectedInquiry.company || '—'}</p>
              </div>
            </div>

            {/* Requested Service & Full Message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 uppercase">REQUESTED SERVICE:</span>
                <span className="px-3 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:border-red-800 text-xs font-mono font-bold dark:text-red-300">
                  {selectedInquiry.service}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase block mb-1.5">
                  CLIENT PROJECT BRIEF / MESSAGE:
                </label>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/80 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            {/* Status Pipeline Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 uppercase block">
                UPDATE ENQUIRY STATUS:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['NEW', 'CONTACTED', 'CLOSED'] as const).map((st) => {
                  const isCurrent = selectedInquiry.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isCurrent
                          ? st === 'NEW'
                            ? 'bg-vexo-red text-white shadow-md shadow-red-500/30'
                            : st === 'CONTACTED'
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                            : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                      }`}
                    >
                      {isCurrent && <Check className="w-3.5 h-3.5" />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 uppercase">
                  INTERNAL PRODUCTION NOTES (PRIVATE)
                </label>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">Visible to admins only</span>
              </div>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal follow-up notes, assigned audio engineer, or quote estimates..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none resize-none leading-relaxed transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-transparent dark:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeleteTarget({ id: selectedInquiry.id, refId: selectedInquiry.referenceId })}
                className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Enquiry</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete Contact Request"
        itemName={deleteTarget?.refId ? `#${deleteTarget.refId}` : undefined}
        message={`Are you sure you want to delete contact request #${deleteTarget?.refId}? All associated client messages and audit notes will be permanently removed.`}
        confirmText="Delete Enquiry"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminInquiriesPage;
