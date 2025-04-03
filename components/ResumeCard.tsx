'use client'

import { useState } from 'react'
import { ProfessionalProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, ExternalLink, Calendar, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResumeCardProps = {
  profile: ProfessionalProfile
  score: number
  explanation?: string
  feedbackId?: string
  relevantChunks?: any[]
  onFeedback?: (feedbackType: 'like' | 'dislike') => void
  onProfileClick?: (profileId: string) => void
  highlightTerms?: string[]
}

export function ResumeCard({ 
  profile, 
  score, 
  explanation,
  feedbackId,
  relevantChunks,
  onFeedback,
  onProfileClick,
  highlightTerms = []
}: ResumeCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Helper to format date ranges
  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return '';
    if (!start) return end;
    if (!end) return `${start} - Present`;
    return `${start} - ${end}`;
  }
  
  // Simplified text highlighter - in a real implementation, 
  // you would want to highlight terms from the search query
  const highlightText = (text: string | undefined) => {
    if (!text) return '';
    
    let highlightedText = text;
    
    highlightTerms.forEach(term => {
      if (!term || term.length < 3) return;
      // Case insensitive matching with word boundaries
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  }
  
  return (
    <div className="w-full bg-card border border-border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
      <div className="p-4">
        {/* Header with name, actions and match score */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium">
              {profile.contact_info?.name || 'Unnamed Profile'}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              {profile.contact_info?.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.contact_info.location}</span>
                </div>
              )}
              <div className="inline-flex items-center bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                Match: {Math.min(100, Math.round(score * 100))}%
              </div>
            </div>
          </div>
          
          {/* Feedback buttons */}
          {onFeedback && (
            <div className="flex space-x-1">
              <Button 
                onClick={() => onFeedback('like')}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                aria-label="Like profile"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">Like</span>
              </Button>
              <Button 
                onClick={() => onFeedback('dislike')}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Dislike profile"
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                <span className="text-xs">Dislike</span>
              </Button>
            </div>
          )}
        </div>
        
        {/* Current/Recent Role */}
        {profile.work_experience && profile.work_experience[0] && (
          <div className="mb-3">
            <div className="font-medium">
              {profile.work_experience[0].role} at {profile.work_experience[0].company}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              <span>{formatDateRange(profile.work_experience[0].start_date, profile.work_experience[0].end_date)}</span>
            </div>
          </div>
        )}
        
        {/* Match explanation */}
        {explanation && (
          <div className="mb-3 p-2.5 bg-primary/5 dark:bg-primary/10 rounded-md text-sm border border-primary/10">
            {highlightText(explanation)}
          </div>
        )}
        
        {/* Skills */}
        <div className="mb-3 flex flex-wrap gap-1">
          {profile.skills?.slice(0, expanded ? undefined : 5).map((skill, i) => (
            <Badge 
              key={i} 
              variant="secondary"
              className={cn(
                highlightTerms.some(term => skill.toLowerCase().includes(term.toLowerCase())) 
                  ? "bg-primary/20 hover:bg-primary/30 text-primary-foreground" 
                  : ""
              )}
            >
              {skill}
            </Badge>
          ))}
          {!expanded && profile.skills && profile.skills.length > 5 && (
            <Badge 
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => setExpanded(true)}
            >
              +{profile.skills.length - 5} more
            </Badge>
          )}
        </div>
        
        {/* Expand/Collapse button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 flex items-center justify-center"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show more
            </>
          )}
        </Button>
        
        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Summary Section */}
            {profile.summary && (
              <div>
                <h4 className="text-sm font-medium mb-1 pb-1 border-b">Summary</h4>
                <p className="text-sm">{highlightText(profile.summary)}</p>
              </div>
            )}
            
            {/* Experience Section */}
            {profile.work_experience && profile.work_experience.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 pb-1 border-b">Experience</h4>
                <div className="space-y-3">
                  {profile.work_experience.map((exp, i) => (
                    <div key={i} className="border-l-2 pl-3 border-border">
                      <div className="font-medium text-sm">{exp.role} at {exp.company}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateRange(exp.start_date, exp.end_date)}</span>
                        {exp.location && (
                          <>
                            <span className="mx-1">•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <ul className="list-disc list-inside text-xs mt-1.5 text-foreground space-y-0.5">
                          {exp.responsibilities.map((resp, j) => (
                            <li key={j} className="pl-0.5">{highlightText(resp)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education Section */}
            {profile.education && profile.education.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 pb-1 border-b">Education</h4>
                <div className="space-y-2">
                  {profile.education.map((edu, i) => (
                    <div key={i}>
                      <div className="font-medium text-sm">
                        {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span>{edu.institution}</span>
                        {edu.end_date && (
                          <>
                            <span className="mx-1">•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{edu.end_date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Projects Section */}
            {profile.projects && profile.projects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 pb-1 border-b">Projects</h4>
                <div className="space-y-3">
                  {profile.projects.map((project, i) => (
                    <div key={i}>
                      <div className="font-medium text-sm">{project.name}</div>
                      {project.description && (
                        <p className="text-xs mt-1">{highlightText(project.description)}</p>
                      )}
                      {project.technologies_used && project.technologies_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {project.technologies_used.map((tech, j) => (
                            <Badge key={j} variant="outline" className="text-xs px-1.5 py-0">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Certifications, Publications, Awards */}
            {(profile.certifications?.length || profile.publications?.length || profile.awards?.length) && (
              <div>
                <h4 className="text-sm font-medium mb-2 pb-1 border-b">Additional Information</h4>
                
                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium">Certifications</h5>
                    <ul className="list-disc list-inside text-xs pl-2 mt-1">
                      {profile.certifications.map((cert, i) => (
                        <li key={i}>{highlightText(cert)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {profile.publications && profile.publications.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium">Publications</h5>
                    <ul className="list-disc list-inside text-xs pl-2 mt-1">
                      {profile.publications.map((pub, i) => (
                        <li key={i}>{highlightText(pub)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {profile.awards && profile.awards.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium">Awards</h5>
                    <ul className="list-disc list-inside text-xs pl-2 mt-1">
                      {profile.awards.map((award, i) => (
                        <li key={i}>{highlightText(award)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* View full profile button */}
            <div className="pt-2">
              <Button
                onClick={() => onProfileClick?.(profile.profile_id)}
                className="w-full flex items-center justify-center"
                variant="default"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}