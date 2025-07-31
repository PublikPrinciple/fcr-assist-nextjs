import { notFound } from 'next/navigation';
import { AssessmentContainer } from '@/components/assessment/AssessmentContainer';
import { getAssessment } from '@/lib/supabase-services';

interface AssessmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { id } = await params;
  
  try {
    const assessment = await getAssessment(id);
    
    if (!assessment) {
      notFound();
    }
    
    return (
      <div className="container mx-auto py-8">
        <AssessmentContainer assessment={assessment} />
      </div>
    );
  } catch (error) {
    console.error('Error loading assessment:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: AssessmentPageProps) {
  const { id } = await params;
  
  try {
    const assessment = await getAssessment(id);
    
    if (!assessment) {
      return {
        title: 'Assessment Not Found'
      };
    }
    
    return {
      title: `${assessment.title} - FCR Assist`,
      description: assessment.description || 'Professional development assessment for early childhood educators'
    };
  } catch (error) {
    return {
      title: 'Assessment - FCR Assist'
    };
  }
}
