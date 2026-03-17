import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../utils/api';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/SurveyForm/StepIndicator';
import DynamicField from '../components/FormBuilder/DynamicField';
import { Save, ChevronLeft, ChevronRight, CheckCircle, Info, Clock, Loader2, MapPin } from 'lucide-react';

const NewVisit = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Drafts are saved automatically');
    const [visitId, setVisitId] = useState(null);
    const [config, setConfig] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const timerRef = useRef(null);
    const { user } = useAuth(); // Import useAuth to get role
    const [exactLocation, setExactLocation] = useState(null);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [coords, setCoords] = useState({ lat: null, lon: null });

    const fetchExactLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    
                    if (data && data.display_name) {
                        setExactLocation(data.display_name);
                        setCoords({ lat: latitude, lon: longitude });
                    } else {
                        setLocationError('Could not translate coordinates to an address');
                    }
                } catch (err) {
                    setLocationError('Failed to fetch address from OpenStreetMap');
                } finally {
                    setFetchingLocation(false);
                }
            },
            (error) => {
                setLocationError('Location permission denied / unavailable');
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Auto-fetch location on load if not editing an existing report
    useEffect(() => {
        if (!id && user) {
            fetchExactLocation();
        }
    }, [id, user]);

    const urlFormType = searchParams.get('formType');

    // Fetch form configuration
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Wait for user to be available
                if (!user) return;
                
                // Determine form type: URL param > Department/Role
                const formType = urlFormType || ((user.department === 'B2C' || user.role === 'home_visit') ? 'home_visit' : 'generic');
                
                const res = await api.get(`/form-config?formType=${formType}`);
                if (res.data?.success && res.data.data) {
                    setConfig(res.data.data);
                } else {
                    console.warn(`No active ${formType} form configuration found`);
                }
            } catch (err) {
                console.error('Error fetching form config:', err);
            } finally {
                setLoadingConfig(false);
            }
        };
        if (user) fetchConfig();
    }, [user?.role, urlFormType]);

    // Generate dynamic schema based on config
    const schema = useMemo(() => {
        if (!config || !config.fields) return z.object({});

        const shape = {};
        config.fields.forEach(field => {
            let fieldSchema;
            switch (field.type) {
                case 'number':
                case 'star-rating':
                    fieldSchema = z.number();
                    if (field.required) fieldSchema = fieldSchema.min(1, `${field.label} is required`);
                    else fieldSchema = fieldSchema.optional().nullable();
                    break;
                case 'toggle':
                    fieldSchema = z.boolean().default(false);
                    break;
                case 'multi-select':
                    fieldSchema = z.array(z.string());
                    if (field.required) fieldSchema = fieldSchema.min(1, `Select at least one ${field.label}`);
                    break;
                case 'textarea':
                    fieldSchema = z.string();
                    if (field.required) fieldSchema = fieldSchema.min(10, `${field.label} must be at least 10 characters`);
                    break;
                default:
                    fieldSchema = z.string();
                    if (field.required) fieldSchema = fieldSchema.min(1, `${field.label} is required`);
                    else fieldSchema = fieldSchema.optional().or(z.literal(''));
            }

            // Simple flat nesting support (meta.companyName)
            const parts = field.id.split('.');
            if (parts.length > 1) {
                const [group, key] = parts;
                if (!shape[group]) shape[group] = {};
                shape[group][key] = fieldSchema;
            } else {
                shape[field.id] = fieldSchema;
            }
        });

        // Convert the nested objects to z.object
        const finalShape = {};
        Object.keys(shape).forEach(key => {
            if (typeof shape[key] === 'object' && !shape[key].safeParse) {
                finalShape[key] = z.object(shape[key]);
            } else {
                finalShape[key] = shape[key];
            }
        });

        return z.object(finalShape);
    }, [config]);

    const { register, handleSubmit, watch, setValue, trigger, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange'
    });

    const formData = watch();

    // Fetch visit data if ID is present
    useEffect(() => {
        if (id && !loadingConfig) {
            setVisitId(id);
            const fetchVisitData = async () => {
                try {
                    const res = await api.get(`/visits/${id}`);
                    const visit = res.data.data;
                    
                    // Format dates for datetime-local input
                    if (visit.meta?.meetingStart) {
                        visit.meta.meetingStart = new Date(visit.meta.meetingStart).toISOString().slice(0, 16);
                    }
                    if (visit.meta?.meetingEnd) {
                        visit.meta.meetingEnd = new Date(visit.meta.meetingEnd).toISOString().slice(0, 16);
                    }

                    if (visit.exactLocation) {
                        setExactLocation(visit.exactLocation);
                    }
                    if (visit.lat && visit.lon) {
                        setCoords({ lat: visit.lat, lon: visit.lon });
                    }
                    reset(visit);
                } catch (err) {
                    console.error('Failed to fetch visit data:', err);
                }
            };
            fetchVisitData();
        }
    }, [id, reset, loadingConfig]);

    // Auto-save logic
    useEffect(() => {
        if (isSaving || loadingConfig) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const hasIdentifier = formData.meta?.companyName || formData.studentInfo?.name;
            if (hasIdentifier) saveDraft();
        }, 60000);
        return () => clearTimeout(timerRef.current);
    }, [formData, isSaving, loadingConfig]);

    const saveDraft = async () => {
        const identifier = formData.meta?.companyName || formData.studentInfo?.name;
        const identifierLabel = formData.studentInfo?.name ? 'Student Name' : 'Company Name';

        if (!identifier) {
            setSaveStatus(`Draft needs ${identifierLabel} to save`);
            return;
        }
        setSaveStatus('Saving draft...');
        try {
            const payload = { ...formData, exactLocation, lat: coords.lat, lon: coords.lon, status: 'draft', formVersion: config?.version, formType: config?.formType };
            if (visitId) {
                await api.put(`/visits/${visitId}`, payload);
            } else {
                const res = await api.post('/visits', payload);
                setVisitId(res.data.data._id);
            }
            setSaveStatus(`Saved at ${new Date().toLocaleTimeString()}`);
        } catch (err) {
            setSaveStatus('Draft save failed');
        }
    };

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            const payload = { ...data, exactLocation, lat: coords.lat, lon: coords.lon, status: 'submitted', formVersion: config?.version, formType: config?.formType };
            if (visitId) {
                await api.put(`/visits/${visitId}`, payload);
            } else {
                await api.post('/visits', payload);
            }
            setSaveStatus('Submitted successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            alert('Error submitting survey: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const groups = useMemo(() => {
        if (!config || !config.fields) return [];
        return [...new Set(config.fields.map(f => f.group))];
    }, [config]);

    const nextStep = async () => {
        const currentGroup = groups[currentStep];
        const stepFieldIds = config.fields.filter(f => f.group === currentGroup).map(f => f.id);
        
        const isStepValid = await trigger(stepFieldIds);
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, groups.length - 1));
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
        window.scrollTo(0, 0);
    };

    if (loadingConfig) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-kanan-blue mb-4" />
            <p className="font-bold">Syncing form configuration...</p>
        </div>
    );

    if (!config) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            <Info className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Form Not Found</h3>
            <p className="max-w-md text-center">There is no active form configuration for your role. Please contact a SuperAdmin to publish a form.</p>
            <button onClick={() => navigate('/')} className="mt-6 btn-primary px-8">Return to Dashboard</button>
        </div>
    );

    return (
        <div className="pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {id ? 'Edit ' : 'New '} 
                        {(config?.formType === 'home_visit' || urlFormType === 'home_visit') ? 'Home Visit Report' : 'Visit Report'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm bg-slate-100 px-2 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-kanan-blue" />
                            <span>{saveStatus}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-kanan-blue/5 text-kanan-navy px-3 py-1 rounded-md border border-kanan-blue/10 max-w-md">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-kanan-blue" />
                            {fetchingLocation ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin text-kanan-blue"/> Identifying location...</span>
                            ) : exactLocation ? (
                                <span className="truncate font-medium text-kanan-navy" title={exactLocation}>{exactLocation}</span>
                            ) : locationError ? (
                                <span className="text-red-500 flex items-center gap-2">{locationError} <button type="button" onClick={fetchExactLocation} className="underline font-medium text-red-600">Retry</button></span>
                            ) : (
                                <span>Location pending</span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={saveDraft}
                    className="flex items-center justify-center gap-2 text-kanan-blue font-semibold hover:bg-kanan-blue/5 px-4 py-2.5 rounded-xl border border-kanan-blue/10 bg-white transition-all shadow-sm"
                >
                    <Save className="w-5 h-5" />
                    <span>Save Draft</span>
                </button>
            </div>

            <StepIndicator currentStep={currentStep} steps={groups} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto px-2">
                <div className="card shadow-xl border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 sm:p-6">
                    <div className="space-y-6">
                        <div className="border-b pb-4 mb-6">
                            <h3 className="text-lg font-bold text-slate-800">{groups[currentStep]}</h3>
                            <p className="text-sm text-slate-500">Please provide the necessary details for this section.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {config.fields
                                .filter(f => f.group === groups[currentStep])
                                .map(field => (
                                    <DynamicField 
                                        key={field.id}
                                        field={field}
                                        register={register}
                                        control={control}
                                        errors={errors}
                                        watch={watch}
                                        setValue={setValue}
                                        Controller={Controller}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xl fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] lg:w-[calc(100%-340px)] max-w-4xl z-40">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-6 py-3 font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Prev
                    </button>
 
                    <div className="text-sm font-bold text-slate-400">
                        {currentStep + 1} / {groups.length}
                    </div>
 
                    {currentStep === groups.length - 1 ? (
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-secondary h-12 px-10 flex items-center gap-2 shadow-lg shadow-kanan-blue/20"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Submit Report
                                    <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="btn-primary h-12 px-10 flex items-center gap-2 shadow-lg shadow-kanan-navy/20"
                        >
                            Next Step
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default NewVisit;
