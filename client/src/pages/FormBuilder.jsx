import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Save, 
    Settings, 
    Layers, 
    CheckCircle2, 
    MoveUp, 
    MoveDown,
    PlusCircle,
    Layout
} from 'lucide-react';

const FormBuilder = () => {
    const { user } = useAuth();
    const [config, setConfig] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [version, setVersion] = useState('');
    const [activeFormType, setActiveFormType] = useState('generic');

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/form-config?formType=${activeFormType}`);
                if (res.data.data) {
                    setConfig(res.data.data);
                    setFields(res.data.data.fields || []);
                    setVersion(res.data.data.version || '1.0.0');
                } else {
                    setConfig(null);
                    setFields([]);
                    setVersion('1.0.0');
                }
            } catch (err) {
                console.error('Error fetching form config:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [activeFormType]);

    const addField = (group) => {
        const newField = {
            id: `field_${Date.now()}`,
            group: group || 'General',
            label: 'New Field',
            type: 'text',
            required: false,
            options: []
        };
        const newFields = [...fields, newField];
        setFields(newFields);
        setSelectedField(newField);
    };

    const updateField = (id, updates) => {
        const newFields = fields.map(f => f.id === id ? { ...f, ...updates } : f);
        setFields(newFields);
        if (selectedField?.id === id) {
            setSelectedField({ ...selectedField, ...updates });
        }
    };

    const deleteField = (id) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            setFields(fields.filter(f => f.id !== id));
            if (selectedField?.id === id) setSelectedField(null);
        }
    };

    const moveField = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const newFields = [...fields];
            [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
            setFields(newFields);
        } else if (direction === 'down' && index < fields.length - 1) {
            const newFields = [...fields];
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
            setFields(newFields);
        }
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const newVersion = (parseFloat(version) + 0.1).toFixed(1);
            await api.put('/form-config', {
                version: newVersion,
                fields: fields,
                isActive: true,
                formType: activeFormType
            });
            setVersion(newVersion);
            alert('Form configuration updated successfully!');
        } catch (err) {
            console.error('Error saving form config:', err);
            alert('Failed to save form configuration');
        } finally {
            setSaving(false);
        }
    };

    const groups = [...new Set(fields.map(f => f.group))];

    if (loading) return <div className="p-8 text-center text-slate-500">Loading form builder...</div>;

    const fieldTypes = [
        'text', 'textarea', 'number', 'date', 'datetime', 
        'dropdown', 'multi-select', 'toggle', 'star-rating', 'file'
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dynamic Form Builder</h1>
                    <p className="text-slate-500">Configure visit survey fields and groups. Current Version: {version}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-4">
                        <button 
                            onClick={() => setActiveFormType('generic')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeFormType === 'generic' ? 'bg-white text-kanan-blue shadow-sm' : 'text-slate-500'}`}
                        >
                            B2B
                        </button>
                        <button 
                            onClick={() => setActiveFormType('home_visit')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeFormType === 'home_visit' ? 'bg-white text-kanan-blue shadow-sm' : 'text-slate-500'}`}
                        >
                            B2C
                        </button>
                    </div>
                    <button 
                        onClick={saveConfig}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-kanan-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md disabled:opacity-50"
                    >
                        {saving ? <PlusCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Publish New Version'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Field List */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="card p-0 overflow-hidden border-none shadow-sm">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-kanan-blue" />
                                Form Structure
                            </h3>
                            <button 
                                onClick={() => addField()}
                                className="p-1.5 bg-kanan-blue/10 text-kanan-blue rounded-lg hover:bg-kanan-blue/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                            {groups.map(group => (
                                <div key={group} className="space-y-2">
                                    <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                        {group}
                                        <button onClick={() => addField(group)} className="hover:text-kanan-blue">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </h4>
                                    <div className="space-y-1">
                                        {fields.filter(f => f.group === group).map((field, idx) => (
                                            <div 
                                                key={field.id}
                                                onClick={() => setSelectedField(field)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer group/item flex items-center justify-between ${
                                                    selectedField?.id === field.id 
                                                    ? 'bg-kanan-blue/5 border-kanan-blue/30' 
                                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        selectedField?.id === field.id ? 'bg-kanan-blue/10 text-kanan-blue' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        <Settings className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-bold ${selectedField?.id === field.id ? 'text-kanan-blue' : 'text-slate-700'}`}>
                                                            {field.label}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{field.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); moveField(fields.indexOf(field), 'up'); }}
                                                        className="p-1 text-slate-400 hover:text-slate-600"
                                                    >
                                                        <MoveUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); moveField(fields.indexOf(field), 'down'); }}
                                                        className="p-1 text-slate-400 hover:text-slate-600"
                                                    >
                                                        <MoveDown className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                                        className="p-1 text-red-400 hover:text-red-500 ml-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Field Editor */}
                <div className="lg:col-span-7">
                    {selectedField ? (
                        <div className="card space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-kanan-blue" />
                                    Configure Field
                                </h3>
                                <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                    ID: {selectedField.id}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Field Label</label>
                                    <input 
                                        type="text"
                                        className="input-field"
                                        value={selectedField.label}
                                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Field Group/Section</label>
                                    <input 
                                        type="text"
                                        className="input-field"
                                        value={selectedField.group}
                                        onChange={(e) => updateField(selectedField.id, { group: e.target.value })}
                                        placeholder="e.g., Agency Profile"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Field Type</label>
                                    <select 
                                        className="input-field"
                                        value={selectedField.type}
                                        onChange={(e) => updateField(selectedField.id, { type: e.target.value, options: [] })}
                                    >
                                        {fieldTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={selectedField.required}
                                            onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kanan-blue"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-700">Required Field</span>
                                    </label>
                                </div>
                            </div>

                            {['dropdown', 'multi-select'].includes(selectedField.type) && (
                                <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Options (Comma separated)</label>
                                    <textarea 
                                        className="input-field h-24"
                                        placeholder="Option 1, Option 2, Option 3"
                                        value={selectedField.options?.join(', ')}
                                        onChange={(e) => updateField(selectedField.id, { options: e.target.value.split(',').map(o => o.trim()).filter(o => o) })}
                                    />
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={() => setSelectedField(null)}
                                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 border-dashed border-2 border-slate-200">
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                <Layout className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600">No Field Selected</h3>
                            <p className="text-slate-400 max-w-xs mt-2">
                                Select a field from the left panel to modify its properties or add a new one.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormBuilder;
