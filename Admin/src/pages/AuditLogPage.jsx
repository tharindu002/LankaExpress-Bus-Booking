import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-logs');
      setLogs(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const columns = [
    { header: 'Action', render: (row) => <StatusBadge status={row.action} /> },
    { header: 'Admin Account', render: (row) => `${row.adminName} (${row.adminEmail})` },
    { header: 'Target Resource', render: (row) => <span className="font-semibold text-slate-200">{row.targetResource}</span> },
    { header: 'Target ID', accessor: 'targetId' },
    { header: 'Audit Reason / Notes', render: (row) => row.reason || 'N/A' },
    { header: 'IP Address', accessor: 'ipAddress' },
    {
      header: 'Timestamp',
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">System Audit Logs</h2>
          <p className="text-xs text-slate-400">Immutable administrative audit trail recording all backend modifications</p>
        </div>
        <button onClick={fetchAuditLogs} className="btn btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Audit Trail
        </button>
      </div>

      {/* Security Rule Guard Notice */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-xs text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <span className="font-bold text-emerald-300 block">Immutable Security Protection</span>
          <span>
            Audit logs are permanently recorded in MongoDB and cannot be deleted or cleared by ordinary admins.
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading audit logs...</div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search admin email, action, target resource..."
            filename="lankaexpressway_audit_logs.csv"
          />
        )}
      </div>
    </div>
  );
};
