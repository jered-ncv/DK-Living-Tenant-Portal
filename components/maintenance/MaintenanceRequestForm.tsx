'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MaintenanceRequestFormProps {
  userId: string
  unitId: string
}

export default function MaintenanceRequestForm({ userId, unitId }: MaintenanceRequestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    category: 'plumbing',
    title: '',
    description: '',
    urgency: 'medium',
  })

  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const categories = [
    { value: 'hvac', label: 'HVAC / Heating / Cooling' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'appliance', label: 'Appliance' },
    { value: 'structural', label: 'Structural / Building' },
    { value: 'pest', label: 'Pest Control' },
    { value: 'other', label: 'Other' },
  ]

  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Can wait a few days' },
    { value: 'medium', label: 'Medium', description: 'Within a few days' },
    { value: 'high', label: 'High', description: 'Within 24 hours' },
    { value: 'emergency', label: 'Emergency', description: 'Immediate attention needed' },
  ]

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const totalPhotos = photos.length + files.length
      
      if (totalPhotos > 5) {
        setError('Maximum 5 photos allowed')
        return
      }

      setError(null)
      setPhotos([...photos, ...files])

      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPhotoPreviews([...photoPreviews, ...newPreviews])
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviews[index])
    
    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create the maintenance request
      const requestData = {
        ...formData,
        userId,
        unitId,
      }

      const response = await fetch('/api/maintenance/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create request')
      }

      const { requestId } = await response.json()

      // Step 2: Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          const formData = new FormData()
          formData.append('file', photo)
          formData.append('requestId', requestId)

          const uploadResponse = await fetch('/api/maintenance/upload-photo', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            console.error('Failed to upload photo:', photo.name)
          }
        }
      }

      // Success! Redirect to maintenance list
      router.push('/maintenance?success=true')
    } catch (err) {
      console.error('Error submitting request:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit request')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief description of the issue"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please provide detailed information about the issue..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Urgency *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {urgencyLevels.map((level) => (
            <label
              key={level.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                formData.urgency === level.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={level.value}
                checked={formData.urgency === level.value}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{level.label}</div>
                    <div className="text-gray-500 text-xs">{level.description}</div>
                  </div>
                </div>
                {formData.urgency === level.value && (
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional, max 5)
        </label>
        
        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 5 && (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-1 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB each)</p>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push('/maintenance')}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}
