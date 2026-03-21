import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Check, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

const PhotoUpload = ({ value, onChange, disabled, label }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value || null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset state
        setError(null);
        setUploading(true);

        try {
            // Compression options
            const options = {
                maxSizeMB: 0.5, // 500KB
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };

            // Compress image
            console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            const compressedFile = await imageCompression(file, options);
            console.log('Compressed size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

            // Prepare for upload
            const formData = new FormData();
            formData.append('photo', compressedFile);

            // Upload via API
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const url = response.data.url;
                setPreview(url);
                onChange(url);
            } else {
                setError('Upload failed. Please try again.');
            }
        } catch (err) {
            console.error('Image processing/upload error:', err);
            setError(err.message || 'Error processing image');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setPreview(null);
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                {preview && !disabled && (
                    <button
                        type="button"
                        onClick={removeFile}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <X size={14} /> Remove
                    </button>
                )}
            </div>

            {!preview ? (
                <div 
                    onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                    className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3
                        ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60' : 
                          'bg-white border-slate-200 hover:border-brand-blue hover:bg-brand-blue/[0.02] shadow-sm hover:shadow-md'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                         capture="environment" // Suggest rear camera on mobile
                        className="hidden"
                        disabled={disabled || uploading}
                    />

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                        ${uploading ? 'bg-slate-100' : 'bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white'}`}>
                        {uploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
                        ) : (
                            <Camera className="w-6 h-6" />
                        )}
                    </div>

                    <div className="text-center">
                        <p className={`text-sm font-bold ${uploading ? 'text-slate-400' : 'text-slate-700'}`}>
                            {uploading ? 'Processing & Uploading...' : 'Click to Take or Upload Photo'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                            PNG, JPG or JPEG • Compressed automatically
                        </p>
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center" />
                    )}
                </div>
            ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg group">
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex items-center gap-2 text-white">
                            <div className="bg-brand-green p-1 rounded-full">
                                <Check size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-bold">Photo Uploaded Successfully</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 font-medium animate-shake">{error}</p>
            )}
        </div>
    );
};

export default PhotoUpload;
