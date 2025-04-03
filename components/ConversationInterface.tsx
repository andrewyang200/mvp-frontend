'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { SearchInput } from './SearchInput'
import { useSearchSession } from '@/hooks/useSearchSession'
import { Button } from './ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

const EXAMPLE_QUERIES = [
  "Software engineers with 5+ years of React experience",
  "Product managers who worked at Google",
  "Data scientists with machine learning expertise",
  "UX designers with healthcare industry background"
]

export function ConversationInterface() {
  const router = useRouter()
  const { toast } = useToast()
  const { 
    messages, 
    sessionId, 
    isSearching, 
    submitSearch, 
    submitRefinement,
    submitFeedback,
    clearConversation
  } = useSearchSession()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (query: string) => {
    // If this is a new conversation, use search endpoint
    if (messages.length === 0 || !sessionId) {
      await submitSearch({ query, top_k: 5 })
    } else {
      // Otherwise, use refinement endpoint with existing session
      await submitRefinement({ refinement_query: query, session_id: sessionId, top_k: 5 })
    }
  }
  
  const handleProfileClick = (profileId: string) => {
    // Navigate to profile detail page
    window.open(`/profile/${profileId}`, '_blank')
    
    // In a real implementation, we'd have a full profile page
    // router.push(`/profile/${profileId}`)
    
    // For now, just show a toast
    toast({
      title: "Profile Details",
      description: `Viewing profile ${profileId}`,
    })
  }
  
  const handleClearConversation = () => {
    clearConversation()
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-8 opacity-80">
            <h2 className="text-2xl font-semibold mb-4">Professional Network Search</h2>
            <p className="mb-8">Ask a question to search through résumés in your network</p>
            <div className="mt-8 space-y-2 text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
              <div className="bg-muted p-2 rounded text-sm">
                "Find software engineers with 5+ years of experience in React"
              </div>
              <div className="bg-muted p-2 rounded text-sm">
                "Show me product managers who worked at Google"
              </div>
              <div className="bg-muted p-2 rounded text-sm">
                "Who has experience with machine learning and Python?"
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearConversation}
                className="text-xs"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear conversation
              </Button>
            </div>
            
            {messages.map((message, index) => (
              <MessageBubble 
                key={index} 
                message={message} 
                onFeedback={message.type === 'response' ? 
                  (profileId, feedbackType, feedbackId) => submitFeedback(profileId, feedbackType, feedbackId) : 
                  undefined
                }
                onProfileClick={handleProfileClick}
              />
            ))}
          </>
        )}
        {isSearching && (
          <div className="flex justify-center p-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <SearchInput 
          onSubmit={handleSubmit} 
          isSearching={isSearching}
          placeholder="Ask about specific skills, experience, or education..."
          suggestionQueries={messages.length === 0 ? EXAMPLE_QUERIES : []}
        />
      </div>
    </div>
  )
}