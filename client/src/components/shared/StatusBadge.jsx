import React from 'react';

const StatusBadge = ({ status }) => {
    const config = {
        draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Draft' },
        submitted: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review' },
        reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reviewed' },
        action_required: { bg: 'bg-red-100', text: 'text-red-700', label: 'Action Required' },
        closed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Closed' }
    };

    const { bg, text, label } = config[status] || config.draft;

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-current bg-opacity-10 ${bg} ${text}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
