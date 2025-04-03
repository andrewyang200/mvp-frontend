'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { 
  SearchQueryRequest, 
  RefineQueryRequest, 
  SearchQueryResponse, 
  Message,
  FeedbackRequest,
  UserMessage,
  SystemMessage
} from '@/types'
import { searchProfiles, refineSearch, sendFeedback } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

type UseSearchSessionReturn = {
  sessionId: string
  messages: Message[]
  isSearching: boolean
  error: string | null
  submitSearch: (request: SearchQueryRequest) => Promise<SearchQueryResponse | null>
  submitRefinement: (request: RefineQueryRequest) => Promise<SearchQueryResponse | null>
  submitFeedback: (profileId: string, feedbackType: 'like' | 'dislike', feedbackId: string) => Promise<void>
  clearConversation: () => void
}

export function useSearchSession(): UseSearchSessionReturn {
  const { toast } = useToast()
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize session ID from localStorage or create new one
  useEffect(() => {
    const storedSessionId = localStorage.getItem('search_session_id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
      
      // Optional: Try to restore previous conversation from localStorage
      try {
        const storedMessages = localStorage.getItem('search_messages')
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages) as Message[]
          // Add proper Date objects for timestamps
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }))
          setMessages(messagesWithDates)
        }
      } catch (err) {
        console.error('Failed to restore conversation:', err)
        // If restoration fails, start fresh
        localStorage.removeItem('search_messages')
      }
    } else {
      const newSessionId = uuidv4()
      setSessionId(newSessionId)
      localStorage.setItem('search_session_id', newSessionId)
    }
  }, [])
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('search_messages', JSON.stringify(messages))
    }
  }, [messages])
  
  // Submit initial search
  const submitSearch = useCallback(async (request: SearchQueryRequest): Promise<SearchQueryResponse | null> => {
    setIsSearching(true)
    setError(null)
    
    // Add user query to messages
    const userMessage: UserMessage = { 
      type: 'query', 
      content: request.query,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    try {
      // Include session ID if available
      const searchRequest = {
        ...request,
        session_id: sessionId || undefined
      }
      
      const response = await searchProfiles(searchRequest)
      
      // Store session ID if returned from backend
      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id)
        localStorage.setItem('search_session_id', response.session_id)
      }
      
      // Add response to messages
      const systemMessage: SystemMessage = {
        type: 'response',
        content: response.message || 'Here are the search results:',
        summary: response.generated_summary,
        results: response.results,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMessage])
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      // Add error message
      const errorSystemMessage: SystemMessage = {
        type: 'response',
        content: `Error: ${errorMessage}`,
        results: [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorSystemMessage])
      
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return null
    } finally {
      setIsSearching(false)
    }
  }, [sessionId, toast])
  
  // Submit refinement query
  const submitRefinement = useCallback(async (request: RefineQueryRequest): Promise<SearchQueryResponse | null> => {
    if (!sessionId) {
      // Fall back to search if no session ID
      return submitSearch({ query: request.refinement_query, top_k: request.top_k })
    }
    
    setIsSearching(true)
    setError(null)
    
    // Add user query to messages
    const userMessage: UserMessage = {
      type: 'query', 
      content: request.refinement_query,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    try {
      const response = await refineSearch({
        ...request,
        session_id: sessionId
      })
      
      // Add response to messages
      const systemMessage: SystemMessage = {
        type: 'response',
        content: response.message || 'Here are the refined results:',
        summary: response.generated_summary,
        results: response.results,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, systemMessage])
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      
      // Add error message
      const errorSystemMessage: SystemMessage = {
        type: 'response',
        content: `Error: ${errorMessage}`,
        results: [],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorSystemMessage])
      
      toast({
        title: "Refinement failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return null
    } finally {
      setIsSearching(false)
    }
  }, [sessionId, submitSearch, toast])
  
  // Submit feedback
  const submitFeedback = useCallback(async (
    profileId: string, 
    feedbackType: 'like' | 'dislike', 
    feedbackId: string
  ): Promise<void> => {
    if (!sessionId) return
    
    // Get the current query from the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'query')
    const queryText = lastUserMessage?.content
    
    // Calculate time to feedback if we have timestamps
    let timeToFeedback = 0
    if (lastUserMessage?.timestamp) {
      timeToFeedback = Math.floor((new Date().getTime() - lastUserMessage.timestamp.getTime()) / 1000)
    }
    
    // Build the feedback request
    const feedback: FeedbackRequest = {
      session_id: sessionId,
      profile_id: profileId,
      feedback_type: feedbackType,
      search_result_feedback_id: feedbackId,
      query_text: queryText,
      user_agent: navigator.userAgent,
      search_timestamp: lastUserMessage?.timestamp?.toISOString(),
      time_to_feedback: timeToFeedback
    }
    
    try {
      await sendFeedback(feedback)
      
      toast({
        title: "Feedback submitted",
        description: feedbackType === 'like' ? "Thanks for the positive feedback!" : "Thanks for your feedback",
        variant: "default",
      })
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      
      toast({
        title: "Feedback submission failed",
        description: "Your feedback could not be submitted. Please try again.",
        variant: "destructive",
      })
    }
  }, [sessionId, messages, toast])
  
  // Clear conversation and start fresh (but keep session ID)
  const clearConversation = useCallback(() => {
    setMessages([])
    localStorage.removeItem('search_messages')
    
    toast({
      title: "Conversation cleared",
      description: "Your conversation history has been cleared",
      variant: "default",
    })
  }, [toast])
  
  return {
    sessionId,
    messages,
    isSearching,
    error,
    submitSearch,
    submitRefinement,
    submitFeedback,
    clearConversation
  }
}