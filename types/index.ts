// API Request/Response Types
export interface SearchQueryRequest {
  query: string
  top_k?: number
  session_id?: string
}

export interface RefineQueryRequest {
  refinement_query: string
  session_id: string
  top_k?: number
}

export interface FeedbackRequest {
  session_id: string
  profile_id: string
  search_result_feedback_id: string
  feedback_type: 'like' | 'dislike'
  comment?: string
  query_text?: string
  user_agent?: string
  search_rank_position?: number
  chunk_id?: string
  search_timestamp?: string
  time_to_feedback?: number
}

export interface SearchQueryResponse {
  query: string
  session_id: string
  processed_query?: ProcessedQuery
  results: SearchResultItem[]
  generated_summary?: string
  message?: string
}

export interface SearchResultItem {
  profile: ProfessionalProfile
  score: number
  explanation?: string
  feedback_id: string
  relevant_chunks?: any[]
  ranking_features?: Record<string, number>
}

export interface ProcessedQuery {
  original_query: string
  semantic_query?: string
  keywords: string[]
  strict_filters: Record<string, any>
  concepts: string[]
  intent?: string
  core_semantic_intent?: string
  essential_entities?: string[]
  query_variations?: string[]
  requested_result_count?: number | null
}

export interface TaskStatusResponse {
  task_id: string
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY'
  metadata?: Record<string, any>
  result?: any
  error?: string
}

export interface ProfileUploadResponse {
  task_id: string
  filename: string
  message: string
}

// Profile Data Types
export interface ProfessionalProfile {
  profile_id: string
  contact_info?: ContactInfo
  summary?: string
  work_experience?: WorkExperience[]
  education?: Education[]
  skills?: string[]
  projects?: Project[]
  certifications?: string[]
  publications?: string[]
  awards?: string[]
  created_at?: string
}

export interface ContactInfo {
  name?: string
  email?: string
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  location?: string
}

export interface WorkExperience {
  company?: string
  role?: string
  start_date?: string
  end_date?: string
  location?: string
  responsibilities?: string[]
  description?: string
  duration_months?: number
}

export interface Education {
  institution?: string
  degree?: string
  field_of_study?: string
  start_date?: string
  end_date?: string
  description?: string
  duration_months?: number
}

export interface Project {
  name?: string
  description?: string
  technologies_used?: string[]
  start_date?: string
  end_date?: string
  url?: string
  duration_months?: number
}

// UI Message Types
export type Message = UserMessage | SystemMessage

export interface UserMessage {
  type: 'query'
  content: string
  timestamp?: Date
}

export interface SystemMessage {
  type: 'response'
  content: string
  summary?: string
  results: SearchResultItem[]
  timestamp?: Date
}