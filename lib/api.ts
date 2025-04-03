import { 
  SearchQueryRequest, 
  SearchQueryResponse, 
  RefineQueryRequest,
  FeedbackRequest,
  ProfessionalProfile,
  ProfileUploadResponse,
  TaskStatusResponse
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
console.log('API_BASE_URL is configured as:', API_BASE_URL)

// Helper for fetch requests with error handling
async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  console.log(`Fetching ${url} with API_BASE_URL: ${API_BASE_URL}`)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (e) {
        console.error('Could not parse JSON error response:', e)
      }
      throw new Error(errorMessage)
    }
    
    return response.json()
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    throw error
  }
}

// Submit initial search
export async function searchProfiles(
  request: SearchQueryRequest
): Promise<SearchQueryResponse> {
  return fetchWithErrorHandling<SearchQueryResponse>(
    `${API_BASE_URL}/search`,
    {
      method: 'POST',
      body: JSON.stringify(request)
    }
  )
}

// Submit refinement query
export async function refineSearch(
  request: RefineQueryRequest
): Promise<SearchQueryResponse> {
  return fetchWithErrorHandling<SearchQueryResponse>(
    `${API_BASE_URL}/refine`,
    {
      method: 'POST',
      body: JSON.stringify(request)
    }
  )
}

// Submit feedback
export async function sendFeedback(
  feedback: FeedbackRequest
): Promise<{ message: string; status: string }> {
  return fetchWithErrorHandling<{ message: string; status: string }>(
    `${API_BASE_URL}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify(feedback)
    }
  )
}

// Get profile details
export async function getProfileDetails(
  profileId: string
): Promise<ProfessionalProfile> {
  return fetchWithErrorHandling<ProfessionalProfile>(
    `${API_BASE_URL}/profiles/${profileId}`
  )
}

// Upload résumé
export async function uploadResume(
  file: File
): Promise<ProfileUploadResponse> {
  const formData = new FormData()
  formData.append('resume_file', file)
  
  const response = await fetch(`${API_BASE_URL}/profiles/upload`, {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    let errorMessage = `Upload failed: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorMessage
    } catch {
      // Could not parse JSON error response
    }
    throw new Error(errorMessage)
  }
  
  return response.json()
}

// Check task status
export async function checkTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  return fetchWithErrorHandling<TaskStatusResponse>(
    `${API_BASE_URL}/profiles/status/${taskId}`
  )
}

// Check API health
export async function checkApiHealth(): Promise<{status: string; checks: Record<string, boolean>}> {
  return fetchWithErrorHandling(
    `${API_BASE_URL}/health`
  )
}