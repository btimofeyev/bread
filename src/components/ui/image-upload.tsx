'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ImageUploadProps {
  value?: string
  onChange: (imageUrl: string) => void
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  onRemove, 
  disabled = false,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (disabled) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload JPEG, PNG, or WebP images only.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Image must be smaller than 5MB.')
      return
    }

    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const { imageUrl } = await response.json()
      onChange(imageUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only set dragging to false if we're leaving the component entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleRemove = async () => {
    if (disabled || !value) return

    // Extract filename from URL for deletion
    const url = new URL(value)
    const fileName = url.pathname.split('/').pop()
    
    if (fileName) {
      try {
        await fetch(`/api/upload/image?fileName=${fileName}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting image:', error)
        // Continue with removal even if deletion fails
      }
    }

    onRemove()
    toast.success('Image removed')
  }

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
          <img
            src={value}
            alt="Product image"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
      
      <div
        className={`
          relative w-full h-48 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                {isDragging ? (
                  <Upload className="h-6 w-6 text-blue-500" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? 'Drop image here' : 'Upload product image'}
              </p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, WebP • Max 5MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}