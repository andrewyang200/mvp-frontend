'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadResume, checkTaskStatus } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2, File } from 'lucide-react'
import { ProfileUploadResponse, TaskStatusResponse } from '@/types'
import { useToast } from '@/components/ui/use-toast'

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    message?: string
    taskId?: string
    status?: string
  }>({})
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus({}) // Reset status when a new file is selected
    }
  }
  
  const pollTaskStatus = async (taskId: string) => {
    setIsPolling(true)
    let intervalId: NodeJS.Timeout
    
    try {
      intervalId = setInterval(async () => {
        const result = await checkTaskStatus(taskId)
        setUploadStatus(prev => ({
          ...prev,
          status: result.status
        }))
        
        if (result.status === 'SUCCESS') {
          clearInterval(intervalId)
          setIsPolling(false)
          toast({
            title: 'Processing complete',
            description: 'Your résumé has been successfully processed and indexed.',
            variant: 'default',
          })
        } else if (result.status === 'FAILURE') {
          clearInterval(intervalId)
          setIsPolling(false)
          toast({
            title: 'Processing failed',
            description: result.error || 'An error occurred while processing your résumé.',
            variant: 'destructive',
          })
        }
      }, 3000) // Poll every 3 seconds
    } catch (err) {
      setIsPolling(false)
      console.error('Error polling task status:', err)
    }
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) return
    
    setIsUploading(true)
    setUploadStatus({})
    
    try {
      const result = await uploadResume(file)
      setUploadStatus({
        success: true,
        message: `Successfully uploaded: ${result.filename}`,
        taskId: result.task_id,
        status: 'PENDING'
      })
      
      // Start polling for task status
      pollTaskStatus(result.task_id)
      
      toast({
        title: 'Upload successful',
        description: 'Your résumé has been uploaded and is being processed.',
        variant: 'default',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setUploadStatus({
        success: false,
        message: errorMessage
      })
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </button>
        <h1 className="text-2xl font-bold mb-2">Upload Résumé</h1>
        <p className="text-muted-foreground">
          Upload résumés to include in your professional network search. 
          Supported formats: PDF, DOCX, TXT.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload a file</CardTitle>
          <CardDescription>
            Upload a résumé to be processed and indexed for searching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
              }`}
            >
              <input
                type="file"
                id="resume-file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <File className="h-10 w-10 text-primary mb-2" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={handleFileButtonClick}
                    className="mt-4"
                  >
                    Change file
                  </Button>
                </div>
              ) : (
                <div 
                  className="cursor-pointer flex flex-col items-center"
                  onClick={handleFileButtonClick}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium">Click to select file</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOCX, or TXT formats accepted
                  </p>
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Résumé
                </>
              )}
            </Button>
          </form>
          
          {uploadStatus.taskId && (
            <div className="mt-6 p-4 rounded-md bg-muted">
              <div className="flex items-center mb-2">
                {uploadStatus.status === 'SUCCESS' ? (
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                ) : uploadStatus.status === 'FAILURE' ? (
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                ) : (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
                )}
                <h3 className="font-medium">
                  {uploadStatus.status === 'SUCCESS' ? 'Processing complete' :
                   uploadStatus.status === 'FAILURE' ? 'Processing failed' :
                   'Processing...'}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {uploadStatus.message}
              </p>
              <p className="text-xs text-muted-foreground">
                Task ID: {uploadStatus.taskId}
              </p>
            </div>
          )}
          
          {uploadStatus.message && !uploadStatus.taskId && (
            <div className={`mt-4 p-3 rounded-md ${
              uploadStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              <p>{uploadStatus.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}