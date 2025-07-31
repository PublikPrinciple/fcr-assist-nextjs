import { Suspense } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ProgressOverview } from '@/components/dashboard/ProgressOverview';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your professional development journey.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading statistics...</div>}>
        <StatsCards />
      </Suspense>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Suspense fallback={<div>Loading progress...</div>}>
            <ProgressOverview />
          </Suspense>
          
          <Suspense fallback={<div>Loading quick actions...</div>}>
            <QuickActions />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<div>Loading recent activity...</div>}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
