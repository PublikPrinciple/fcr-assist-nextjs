import { Suspense } from 'react';
import { AssessmentCards } from '@/components/assessment/AssessmentCards';
import { AssessmentFilters } from '@/components/assessment/AssessmentFilters';
import { AssessmentSearch } from '@/components/assessment/AssessmentSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Award, Users } from 'lucide-react';

const categoryStats = [
  {
    icon: BookOpen,
    title: 'Classroom Management',
    count: 12,
    description: 'Environment setup and behavior strategies'
  },
  {
    icon: Clock,
    title: 'Curriculum Planning',
    count: 8,
    description: 'Educational program design and implementation'
  },
  {
    icon: Award,
    title: 'Professional Development',
    count: 6,
    description: 'Continuous learning and growth practices'
  },
  {
    icon: Users,
    title: 'Family Engagement',
    count: 10,
    description: 'Building partnerships with families'
  }
];

export default function AssessmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">
          Evaluate your professional competencies across key areas of early childhood education.
        </p>
      </div>
      
      {/* Category Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categoryStats.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.count}</div>
                <p className="text-xs text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 max-w-md">
          <AssessmentSearch />
        </div>
        <AssessmentFilters />
      </div>
      
      {/* Assessment Cards */}
      <Suspense fallback={<div>Loading assessments...</div>}>
        <AssessmentCards />
      </Suspense>
    </div>
  );
}
