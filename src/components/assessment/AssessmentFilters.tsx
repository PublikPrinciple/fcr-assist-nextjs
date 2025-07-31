'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';

const categories = [
  { value: 'classroom_management', label: 'Classroom Management' },
  { value: 'curriculum_planning', label: 'Curriculum Planning' },
  { value: 'child_development', label: 'Child Development' },
  { value: 'family_engagement', label: 'Family Engagement' },
  { value: 'professional_development', label: 'Professional Development' },
  { value: 'health_safety', label: 'Health & Safety' },
  { value: 'inclusive_practices', label: 'Inclusive Practices' },
  { value: 'assessment_evaluation', label: 'Assessment & Evaluation' }
];

const statuses = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

const durations = [
  { value: '0-15', label: '0-15 minutes' },
  { value: '15-30', label: '15-30 minutes' },
  { value: '30-60', label: '30-60 minutes' },
  { value: '60+', label: '60+ minutes' }
];

export function AssessmentFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedStatuses(prev => [...prev, status]);
    } else {
      setSelectedStatuses(prev => prev.filter(s => s !== status));
    }
  };

  const handleDurationChange = (duration: string, checked: boolean) => {
    if (checked) {
      setSelectedDurations(prev => [...prev, duration]);
    } else {
      setSelectedDurations(prev => prev.filter(d => d !== duration));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedDurations([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedStatuses.length > 0 || selectedDurations.length > 0;

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {selectedCategories.length + selectedStatuses.length + selectedDurations.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              checked={selectedCategories.includes(category.value)}
              onCheckedChange={(checked) => handleCategoryChange(category.value, checked)}
            >
              {category.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statuses.map((status) => (
            <DropdownMenuCheckboxItem
              key={status.value}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={(checked) => handleStatusChange(status.value, checked)}
            >
              {status.label}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Duration</DropdownMenuLabel>
          {durations.map((duration) => (
            <DropdownMenuCheckboxItem
              key={duration.value}
              checked={selectedDurations.includes(duration.value)}
              onCheckedChange={(checked) => handleDurationChange(duration.value, checked)}
            >
              {duration.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
      
      {/* Active filter badges */}
      <div className="flex flex-wrap gap-1">
        {selectedCategories.map((category) => {
          const categoryLabel = categories.find(c => c.value === category)?.label;
          return (
            <Badge key={category} variant="secondary" className="text-xs">
              {categoryLabel}
              <button
                onClick={() => handleCategoryChange(category, false)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          );
        })}
        
        {selectedStatuses.map((status) => {
          const statusLabel = statuses.find(s => s.value === status)?.label;
          return (
            <Badge key={status} variant="secondary" className="text-xs">
              {statusLabel}
              <button
                onClick={() => handleStatusChange(status, false)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          );
        })}
        
        {selectedDurations.map((duration) => {
          const durationLabel = durations.find(d => d.value === duration)?.label;
          return (
            <Badge key={duration} variant="secondary" className="text-xs">
              {durationLabel}
              <button
                onClick={() => handleDurationChange(duration, false)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
