'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, BookOpen, ArrowRight } from 'lucide-react';
import { getAssessments, getUserAssessmentSubmissions } from '@/lib/supabase-services';
import type { Assessment, AssessmentSubmission } from '@/types/assessment';

interface AssessmentCardsProps {
  limit?: number;
  showViewAll?: boolean;
  category?: string;
}

const categoryIcons = {
  classroom_management: BookOpen,
  curriculum_planning: Users,
  child_development: Users,
  family_engagement: Users,
  professional_development: Users,
  health_safety: Users,
  inclusive_practices: Users,
  assessment_evaluation: Users
};

export function AssessmentCards({ limit, showViewAll = false, category }: AssessmentCardsProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assessmentsData, submissionsData] = await Promise.all([
          getAssessments({ category, limit }),
          getUserAssessmentSubmissions()
        ]);
        setAssessments(assessmentsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error loading assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category, limit]);

  const getSubmissionForAssessment = (assessmentId: string) => {
    return submissions.find(sub => sub.assessment_id === assessmentId);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(limit || 6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => {
          const submission = getSubmissionForAssessment(assessment.id);
          const Icon = categoryIcons[assessment.category as keyof typeof categoryIcons] || BookOpen;
          const progress = submission?.percent_complete || 0;
          
          return (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <Badge variant="secondary">
                      {assessment.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(submission?.status)} text-white border-0`}
                  >
                    {getStatusText(submission?.status)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {assessment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{assessment.estimated_time} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{Array.isArray(assessment.sections) ? assessment.sections.length : 1} sections</span>
                  </div>
                </div>
                
                {submission && progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                <Button asChild className="w-full">
                  <Link href={`/assessment/${assessment.id}`}>
                    {submission?.status === 'completed' ? 'View Results' : 
                     submission ? 'Continue Assessment' : 'Start Assessment'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {showViewAll && assessments.length > 0 && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/assessments">
              View All Assessments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      
      {assessments.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assessments Found</h3>
            <p className="text-muted-foreground text-center">
              {category 
                ? `No assessments available in the ${category.replace('_', ' ')} category.`
                : 'No assessments are currently available.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
