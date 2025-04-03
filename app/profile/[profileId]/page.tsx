'use client'

import { useEffect, useState } from 'react'
import { getProfileDetails } from '@/lib/api'
import { ProfessionalProfile } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, Building, Calendar, MapPin, GraduationCap, Award, FileText } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.profileId as string
  
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await getProfileDetails(profileId)
        setProfile(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Could not load profile details')
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present'
    if (dateString === 'Present') return 'Present'
    try {
      return format(new Date(dateString), 'MMM yyyy')
    } catch (e) {
      return dateString
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Profile</h2>
              <p className="text-muted-foreground mb-4">{error || 'Profile not found'}</p>
              <Button onClick={handleBack}>Return to Search</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 mb-8">
      <Button variant="outline" onClick={handleBack} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Search
      </Button>

      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {profile.contact_info?.name || 'Professional Profile'}
              </CardTitle>
              <CardDescription className="text-lg">
                {profile.contact_info?.location && (
                  <span className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {profile.contact_info.location}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profile.summary && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p className="text-muted-foreground whitespace-pre-line">{profile.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      {profile.work_experience && profile.work_experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Building className="mr-2 h-5 w-5" /> 
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.work_experience.map((experience, idx) => (
              <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{experience.role}</h3>
                    <p className="text-muted-foreground">{experience.company}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                    </span>
                  </div>
                </div>
                {experience.location && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <MapPin className="inline mr-1 h-3.5 w-3.5" />
                    {experience.location}
                  </p>
                )}
                {experience.description && (
                  <p className="mt-2 text-sm">{experience.description}</p>
                )}
                {experience.responsibilities && experience.responsibilities.length > 0 && (
                  <div className="mt-2">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {experience.responsibilities.map((responsibility, i) => (
                        <li key={i}>{responsibility}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" /> 
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((education, idx) => (
              <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{education.institution}</h3>
                    <p className="text-muted-foreground">
                      {education.degree}{education.field_of_study ? `, ${education.field_of_study}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {formatDate(education.start_date)} - {formatDate(education.end_date)}
                    </span>
                  </div>
                </div>
                {education.description && (
                  <p className="mt-2 text-sm">{education.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects */}
      {profile.projects && profile.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" /> 
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.projects.map((project, idx) => (
              <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.technologies_used && project.technologies_used.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies_used.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      <span>
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </span>
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="mt-2 text-sm">{project.description}</p>
                )}
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm inline-block mt-1"
                  >
                    View Project
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Award className="mr-2 h-5 w-5" /> 
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {profile.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Other sections like Publications, Awards, etc. can be added similarly */}
    </div>
  )
}