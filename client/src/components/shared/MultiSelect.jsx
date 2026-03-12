import React from 'react';
import { X } from 'lucide-react';

const MultiSelect = ({ options, value = [], onChange, label, placeholder }) => {
    const toggleOption = (option) => {
        const newValue = value.includes(option)
            ? value.filter((v) => v !== option)
            : [...value, option];
        onChange(newValue);
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
            <div className="min-h-[42px] p-1 border border-slate-300 rounded-md bg-white flex flex-wrap gap-2 items-center">
                {value.length === 0 && (
                    <span className="text-slate-400 text-sm ml-2">{placeholder || 'Select options...'}</span>
                )}
                {value.map((val) => (
                    <span
                        key={val}
                        className="bg-kanan-blue/10 text-kanan-blue text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-kanan-blue/20"
                    >
                        {val}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleOption(val); }}
                            className="hover:text-red-500"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {options.map((option) => {
                    const isSelected = value.includes(option);
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => toggleOption(option)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${isSelected
                                    ? 'bg-kanan-navy border-kanan-navy text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MultiSelect;
