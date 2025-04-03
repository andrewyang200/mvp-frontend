'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Send, Loader2 } from 'lucide-react'

type SearchInputProps = {
  onSubmit: (query: string) => Promise<void>
  isSearching: boolean
  placeholder?: string
  suggestionQueries?: string[]
}

export function SearchInput({ 
  onSubmit, 
  isSearching, 
  placeholder = "Ask a question...",
  suggestionQueries = []
}: SearchInputProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (query.trim() && !isSearching) {
      await onSubmit(query.trim())
      setQuery('')
    }
  }
  
  const handleSuggestionClick = async (suggestion: string) => {
    if (!isSearching) {
      await onSubmit(suggestion)
      setQuery('')
    }
  }
  
  return (
    <div className="w-full">
      {/* Example suggestions */}
      {suggestionQueries.length > 0 && query === '' && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestionQueries.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isSearching}
              className="text-xs"
            >
              <Search className="mr-2 h-3 w-3" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isSearching}
          className="pr-12"
        />
        <Button
          type="submit"
          disabled={!query.trim() || isSearching}
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}