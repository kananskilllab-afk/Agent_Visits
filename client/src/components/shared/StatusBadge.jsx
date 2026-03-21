import React from 'react';

const STATUS_CFG = {
    draft:           { label: 'Draft',           bg: 'bg-slate-100',         text: 'text-slate-600',      dot: 'bg-slate-400',     ring: 'ring-slate-200'       },
    submitted:       { label: 'Pending Review',  bg: 'bg-orange-50',         text: 'text-brand-orange',   dot: 'bg-brand-orange',  ring: 'ring-brand-orange/20' },
    reviewed:        { label: 'Reviewed',        bg: 'bg-blue-50',           text: 'text-brand-sky',      dot: 'bg-brand-sky',     ring: 'ring-brand-sky/20'    },
    action_required: { label: 'Action Required', bg: 'bg-red-50',            text: 'text-red-600',        dot: 'bg-red-500',       ring: 'ring-red-400/20'      },
    closed:          { label: 'Closed',          bg: 'bg-green-50',          text: 'text-brand-green',    dot: 'bg-brand-green',   ring: 'ring-brand-green/20'  },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

export default StatusBadge;
