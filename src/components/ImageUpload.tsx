'use client';

import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  onUploadStart?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, onError, onUploadStart, className = '', disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB as per backend spec)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to external backend
    setIsUploading(true);
    onUploadStart?.(); // Notify parent that upload started
    try {
      console.log('checkthis', '📤 Uploading image...');
      const response = await api.uploadImage(file);
      console.log('checkthis', '✅ Upload successful! URL:', response);
      
      onChange(response);
    } catch (error) {
      console.error('checkthis', '❌ Upload failed:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Image
      </label>
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${
              disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
} 