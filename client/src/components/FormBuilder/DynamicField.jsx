import React from 'react';
import MultiSelect from '../shared/MultiSelect';
import StarRating from '../shared/StarRating';

const DynamicField = ({ field, register, control, errors, watch, setValue, Controller }) => {
    const { id, label, type, required, options, group } = field;
    
    // Support nested names (e.g., agencyProfile.address)
    const name = id;

    const error = id.split('.').reduce((obj, key) => obj?.[key], errors);

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea 
                        {...register(name)} 
                        className={`input-field h-24 ${error ? 'border-red-500' : ''}`} 
                        placeholder={`Enter ${label}...`}
                    />
                );
            case 'number':
                return (
                    <input 
                        type="number" 
                        {...register(name, { valueAsNumber: true })} 
                        className={`input-field ${error ? 'border-red-500' : ''}`} 
                    />
                );
            case 'date':
                return (
                    <input 
                        type="date" 
                        {...register(name)} 
                        className={`input-field ${error ? 'border-red-500' : ''}`} 
                    />
                );
            case 'datetime':
                return (
                    <input 
                        type="datetime-local" 
                        {...register(name)} 
                        className={`input-field ${error ? 'border-red-500' : ''}`} 
                    />
                );
            case 'dropdown':
                return (
                    <select {...register(name)} className={`input-field ${error ? 'border-red-500' : ''}`}>
                        <option value="">Select {label}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            case 'multi-select':
                return (
                    <Controller
                        name={name}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <MultiSelect
                                label={label}
                                options={options}
                                value={value || []}
                                onChange={onChange}
                            />
                        )}
                    />
                );
            case 'star-rating':
                return (
                    <Controller
                        name={name}
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <StarRating 
                                label={label} 
                                value={value || 0} 
                                onChange={onChange} 
                            />
                        )}
                    />
                );
            case 'toggle':
                return (
                    <div className="flex items-center gap-4 py-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                {...register(name)} 
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kanan-blue"></div>
                        </label>
                    </div>
                );
            default:
                return (
                    <input 
                        type="text" 
                        {...register(name)} 
                        className={`input-field ${error ? 'border-red-500' : ''}`} 
                        placeholder={`Enter ${label}...`}
                    />
                );
        }
    };

    return (
        <div className={`${['textarea', 'multi-select', 'toggle'].includes(type) ? 'md:col-span-2' : ''} space-y-1.5`}>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
                {label} {required && '*'}
            </label>
            {renderInput()}
            {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
        </div>
    );
};

export default DynamicField;
