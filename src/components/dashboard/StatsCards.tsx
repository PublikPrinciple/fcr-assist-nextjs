'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Award, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { getDashboardStats } from '@/lib/supabase-services';

interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  averageScore: number;
  totalTimeSpent: number;
  completionRate: number;
  recentActivity: {
    lastAssessmentDate: string | null;
    lastCompletedAssessment: string | null;
  };
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = stats.totalAssessments > 0 
    ? Math.round((stats.completedAssessments / stats.totalAssessments) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Assessments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Assessments
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAssessments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.inProgressAssessments > 0 && (
              <>
                <Badge variant="secondary" className="mr-1">
                  {stats.inProgressAssessments} in progress
                </Badge>
              </>
            )}
            Available for your role
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completion Rate
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage}%</div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={completionPercentage} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">
              {stats.completedAssessments}/{stats.totalAssessments}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Score
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completedAssessments > 0 ? (
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Based on {stats.completedAssessments} completed
              </span>
            ) : (
              'Complete assessments to see score'
            )}
          </p>
        </CardContent>
      </Card>

      {/* Time Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Time Invested
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalTimeSpent > 0 ? `${Math.round(stats.totalTimeSpent)}h` : '0h'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.recentActivity.lastAssessmentDate ? (
              `Last activity: ${new Date(stats.recentActivity.lastAssessmentDate).toLocaleDateString()}`
            ) : (
              'Start your first assessment'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
