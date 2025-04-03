'use client'

import { Message } from '@/types'
import { ResumeCard } from './ResumeCard'
import { cn } from '@/lib/utils'
import { MessageSquare, Bot } from 'lucide-react'

type MessageBubbleProps = { 
  message: Message
  onFeedback?: (profileId: string, feedbackType: 'like' | 'dislike', feedbackId: string) => void
  onProfileClick?: (profileId: string) => void
  highlightTerms?: string[]
}

export function MessageBubble({ 
  message, 
  onFeedback,
  onProfileClick,
  highlightTerms = []
}: MessageBubbleProps) {
  // Extract search terms from the message if possible
  const getSearchTerms = () => {
    if (message.type === 'response' && message.results.length > 0) {
      // Try to get keywords from processed query
      const processedQuery = message.results[0]?.profile?.parsing_meta?.processed_query
      if (processedQuery?.keywords) {
        return [...processedQuery.keywords, ...(processedQuery.concepts || [])]
      }
    }
    return highlightTerms
  }
  
  const searchTerms = getSearchTerms()
  
  // For a user query message
  if (message.type === 'query') {
    return (
      <div className="flex justify-end mb-4 items-start">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-md shadow-sm">
          <div className="flex items-start">
            <MessageSquare className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <p>{message.content}</p>
          </div>
        </div>
      </div>
    )
  }
  
  // For a system response message
  return (
    <div className="flex flex-col space-y-3 mb-6">
      <div className="flex items-start">
        <div className={cn(
          "bg-muted text-foreground p-3 rounded-lg max-w-md shadow-sm",
          !message.results.length && "border border-red-200 dark:border-red-900"
        )}>
          <div className="flex items-start">
            <Bot className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <p>{message.content}</p>
          </div>
        </div>
      </div>
      
      {/* Show generated summary if available */}
      {message.summary && (
        <div className="bg-primary/5 dark:bg-primary/10 p-3 rounded-lg max-w-xl border-l-4 border-primary shadow-sm">
          <p className="text-sm">{message.summary}</p>
        </div>
      )}
      
      {/* Display search results */}
      {message.results && message.results.length > 0 && (
        <div className="space-y-4 mt-1 w-full max-w-3xl">
          {message.results.map((result) => (
            <ResumeCard 
              key={result.profile.profile_id}
              profile={result.profile}
              score={result.score}
              explanation={result.explanation}
              onFeedback={onFeedback ? 
                (type) => onFeedback(result.profile.profile_id, type, result.feedback_id) : 
                undefined
              }
              onProfileClick={onProfileClick}
              feedbackId={result.feedback_id}
              relevantChunks={result.relevant_chunks}
              highlightTerms={searchTerms}
            />
          ))}
        </div>
      )}
      
      {/* No results message */}
      {message.results && message.results.length === 0 && !message.content.toLowerCase().includes('error') && (
        <div className="bg-muted/50 border border-border p-4 rounded-lg text-center w-full max-w-xl">
          <p className="text-sm text-muted-foreground">No results found. Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}