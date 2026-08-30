import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = status.toString().toLowerCase();

  let badgeClass = 'badge-pending';

  if (['active', 'paid', 'completed', 'verified', 'credit', 'super luxury', 'luxury'].includes(s)) {
    badgeClass = 'badge-active';
  } else if (['pending', 'partially verified', '2+2'].includes(s)) {
    badgeClass = 'badge-pending';
  } else if (['suspended', 'cancelled', 'failed', 'inactive', 'debit'].includes(s)) {
    badgeClass = 'badge-suspended';
  } else if (['refunded', 'admin', 'admin_adjustment', 'booking_refund'].includes(s)) {
    badgeClass = 'badge-refunded';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
