import React from 'react';

export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  let badgeClass = 'badge-info';
  let label = status;

  if (['active', 'valid', 'approved', 'verified', 'published', 'claimed'].includes(s)) {
    badgeClass = 'badge-success';
  } else if (['expired', 'under_review', 'waiting_for_customer', 'more_information_required', 'pending_otp'].includes(s)) {
    badgeClass = 'badge-warning';
  } else if (['revoked', 'rejected', 'suspended', 'tamper_detected', 'failed'].includes(s)) {
    badgeClass = 'badge-danger';
  }

  // Format label cleanly
  label = String(status || '').replace(/_/g, ' ');

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
}

