'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Clock, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  getAssessmentSubmission, 
  createAssessmentSubmission, 
  updateAssessmentSubmission,
  completeAssessmentSubmission
} from '@/lib/supabase-services';
import type { Assessment, AssessmentSubmission } from '@/types/assessment';
import 'survey-core/defaultV2.min.css';

interface AssessmentContainerProps {
  assessment: Assessment;
}

export function AssessmentContainer({ assessment }: AssessmentContainerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [submission, setSubmission] = useState<AssessmentSubmission | null>(null);
  const [survey, setSurvey] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    if (user && assessment) {
      initializeAssessment();
    }
  }, [user, assessment]);

  const initializeAssessment = async () => {
    try {
      // Check for existing submission
      let existingSubmission = await getAssessmentSubmission(assessment.id);
      
      if (!existingSubmission) {
        // Create new submission
        existingSubmission = await createAssessmentSubmission({
          assessment_id: assessment.id,
          responses: [],
          status: 'in_progress'
        });
      }
      
      setSubmission(existingSubmission);
      
      // Initialize Survey.js model
      const surveyModel = new Model({
        title: assessment.title,
        description: assessment.description,
        pages: Array.isArray(assessment.sections) ? assessment.sections : [],
        showProgressBar: 'top',
        progressBarType: 'buttons',
        showQuestionNumbers: 'onPage',
        questionErrorLocation: 'bottom',
        completeText: 'Complete Assessment',
        showPreviewBeforeComplete: 'showAnsweredQuestions'
      });
      
      // Load existing responses
      if (existingSubmission.responses && Array.isArray(existingSubmission.responses)) {
        const responseData: Record<string, any> = {};
        existingSubmission.responses.forEach((response: any) => {
          if (response.questionId && response.value !== undefined) {
            responseData[response.questionId] = response.value;
          }
        });
        surveyModel.data = responseData;
      }
      
      // Set up auto-save
      surveyModel.onValueChanged.add((sender, options) => {
        if (autoSaveEnabled) {
          debouncedSave(sender.data);
        }
      });
      
      // Handle completion
      surveyModel.onComplete.add((sender) => {
        handleComplete(sender.data);
      });
      
      setSurvey(surveyModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize assessment');
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function
  let saveTimeout: NodeJS.Timeout;
  const debouncedSave = (data: any) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveProgress(data);
    }, 2000);
  };

  const saveProgress = async (data: any) => {
    if (!submission || saving) return;
    
    setSaving(true);
    try {
      const responses = Object.entries(data).map(([questionId, value]) => ({
        questionId,
        value,
        timestamp: new Date().toISOString()
      }));
      
      const totalQuestions = getTotalQuestions();
      const answeredQuestions = Object.keys(data).length;
      const percentComplete = Math.round((answeredQuestions / totalQuestions) * 100);
      
      await updateAssessmentSubmission(submission.id, {
        responses,
        percent_complete: percentComplete
      });
      
      setSubmission(prev => prev ? {
        ...prev,
        responses,
        percent_complete: percentComplete
      } : null);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (data: any) => {
    if (!submission) return;
    
    setSaving(true);
    try {
      const responses = Object.entries(data).map(([questionId, value]) => ({
        questionId,
        value,
        timestamp: new Date().toISOString()
      }));
      
      await completeAssessmentSubmission(submission.id, responses);
      
      // Redirect to results or dashboard
      router.push(`/dashboard?completed=${assessment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
    } finally {
      setSaving(false);
    }
  };

  const getTotalQuestions = (): number => {
    if (!Array.isArray(assessment.sections)) return 0;
    
    return assessment.sections.reduce((total, section: any) => {
      return total + (Array.isArray(section.questions) ? section.questions.length : 0);
    }, 0);
  };

  const handleManualSave = () => {
    if (survey && submission) {
      saveProgress(survey.data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const progress = submission?.percent_complete || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          {saving && (
            <Badge variant="outline">
              <Save className="mr-1 h-3 w-3" />
              Saving...
            </Badge>
          )}
          {submission?.status === 'completed' && (
            <Badge variant="default">
              <CheckCircle className="mr-1 h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
      </div>
      
      {/* Assessment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{assessment.title}</CardTitle>
              <CardDescription className="mt-2">
                {assessment.description}
              </CardDescription>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                {assessment.estimated_time} minutes
              </div>
              <Badge variant="secondary">
                {assessment.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>
      
      {/* Survey Component */}
      {survey && (
        <Card>
          <CardContent className="p-6">
            <Survey model={survey} />
          </CardContent>
        </Card>
      )}
      
      {/* Manual Save Button */}
      {survey && submission?.status !== 'completed' && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={handleManualSave}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
        </div>
      )}
    </div>
  );
}
