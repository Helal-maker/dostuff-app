import React, { useState } from "react";
import ExamOverviewGrid from "@/components/exam/ExamOverviewGrid";
import ContributionHeatmap from "@/components/exam/ContributionHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutGrid,
  Activity,
  Settings,
  Palette,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockExams = [
  {
    id: "1",
    title: "Advanced Mathematics Quiz",
    description: "Comprehensive test covering calculus, linear algebra, and statistics",
    language: "english",
    created_at: "2024-12-01T10:00:00Z",
    is_published: true,
    share_link: "math-quiz-2024",
    question_count: 25,
    attempt_count: 156,
    average_score: 78,
    status: "published" as const
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Basic concepts in mechanics, thermodynamics, and electromagnetism",
    language: "english",
    created_at: "2024-11-28T14:30:00Z",
    is_published: true,
    share_link: "physics-fundamentals",
    question_count: 30,
    attempt_count: 89,
    average_score: 82,
    status: "published" as const
  },
  {
    id: "3",
    title: "Chemistry Lab Assessment",
    description: "Practical laboratory skills and theoretical knowledge",
    language: "english",
    created_at: "2024-11-25T09:15:00Z",
    is_published: false,
    question_count: 20,
    attempt_count: 0,
    status: "draft" as const
  },
  {
    id: "4",
    title: "Biology Final Exam",
    description: "Cell biology, genetics, ecology, and evolution",
    language: "english",
    created_at: "2024-11-20T16:45:00Z",
    is_published: true,
    share_link: "biology-final-2024",
    question_count: 40,
    attempt_count: 203,
    average_score: 75,
    status: "published" as const
  },
  {
    id: "5",
    title: "Computer Science Algorithms",
    description: "Data structures, sorting algorithms, and complexity analysis",
    language: "english",
    created_at: "2024-11-15T11:20:00Z",
    is_published: true,
    share_link: "cs-algorithms",
    question_count: 15,
    attempt_count: 67,
    average_score: 88,
    status: "published" as const
  }
];

// Generate mock contribution data for the last year
const generateMockContributionData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Simulate exam activity with some randomness
    let value = 0;
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    // Higher activity on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      value = Math.floor(Math.random() * 8);
    }
    
    // Special events or higher activity days
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      value += Math.floor(Math.random() * 5);
    }
    
    // Some days with no activity
    if (Math.random() < 0.3) {
      value = 0;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
      label: `${date.toLocaleDateString()}: ${value} exam${value !== 1 ? 's' : ''} completed`
    });
  }
  
  return data;
};

const ComponentDemo: React.FC = () => {
  const [exams] = useState(mockExams);
  const [contributionData] = useState(generateMockContributionData());
  const [activeColorScheme, setActiveColorScheme] = useState<'green' | 'blue' | 'purple' | 'orange'>('green');
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleCreateExam = () => {
    console.log("Create exam clicked");
  };

  const handleViewAnalytics = (examId: string) => {
    console.log("View analytics for exam:", examId);
  };

  const handleShareExam = (shareLink: string) => {
    console.log("Share exam:", shareLink);
  };

  const handleViewExam = (examId: string) => {
    console.log("View exam:", examId);
  };

  const handleDateClick = (date: string, value: number) => {
    console.log("Date clicked:", date, "Value:", value);
  };

  const refreshData = () => {
    console.log("Refreshing data...");
    // In a real app, this would refetch the data
  };

  const colorSchemes = [
    { name: 'Green', value: 'green' as const, color: 'text-green-600' },
    { name: 'Blue', value: 'blue' as const, color: 'text-blue-600' },
    { name: 'Purple', value: 'purple' as const, color: 'text-purple-600' },
    { name: 'Orange', value: 'orange' as const, color: 'text-orange-600' }
  ];

  const viewportSizes = [
    { name: 'Desktop', value: 'desktop' as const, icon: Monitor, size: 'w-full max-w-7xl' },
    { name: 'Tablet', value: 'tablet' as const, icon: Tablet, size: 'max-w-4xl' },
    { name: 'Mobile', value: 'mobile' as const, icon: Smartphone, size: 'max-w-sm' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Component Demo: Responsive Grid & 30-Day Heatmap
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Demonstration of the responsive grid layout and 30-day exam performance heatmap components
          </p>
          
          {/* Demo Controls */}
          <Card className="p-6 bg-gradient-card border-0 shadow-medium mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Grid Layout Demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">30-Day Heatmap Demo</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Color Scheme Selector */}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Color:</span>
                  <div className="flex gap-1">
                    {colorSchemes.map((scheme) => (
                      <Button
                        key={scheme.value}
                        variant={activeColorScheme === scheme.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveColorScheme(scheme.value)}
                        className="h-8 px-3"
                      >
                        <span className={cn("w-2 h-2 rounded-full mr-1", scheme.color.replace('text-', 'bg-'))} />
                        {scheme.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Viewport Size Selector */}
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">View:</span>
                  <div className="flex gap-1">
                    {viewportSizes.map((size) => (
                      <Button
                        key={size.value}
                        variant={viewportSize === size.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewportSize(size.value)}
                        className="h-8 px-3"
                      >
                        <size.icon className="w-3 h-3 mr-1" />
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Button onClick={refreshData} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Demo Content */}
        <div className={cn(
          "mx-auto transition-all duration-300",
          viewportSizes.find(s => s.value === viewportSize)?.size
        )}>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="grid">Responsive Grid Layout</TabsTrigger>
              <TabsTrigger value="heatmap">30-Day Heatmap</TabsTrigger>
              <TabsTrigger value="combined">Combined Demo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Responsive Grid Layout</h2>
                <p className="text-muted-foreground">
                  Two-up, one-down configuration with "Total Exams" prominently displayed
                </p>
                <Badge variant="outline" className="mt-2">
                  Try resizing your browser window to see responsive behavior
                </Badge>
              </div>
              <ExamOverviewGrid
                exams={exams}
                onCreateExam={handleCreateExam}
                onViewAnalytics={handleViewAnalytics}
                onShareExam={handleShareExam}
                onViewExam={handleViewExam}
              />
            </TabsContent>
            
            <TabsContent value="heatmap" className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">30-Day Heatmap</h2>
                <p className="text-muted-foreground">
                  Daily exam performance display showing the last 30 days
                </p>
                <Badge variant="outline" className="mt-2">
                  Hover over days to see details • Click to interact
                </Badge>
              </div>
              <div className="space-y-6">
                <ContributionHeatmap
                  data={contributionData}
                  title="Exam Performance"
                  subtitle="Daily exam performance over the last 30 days"
                  colorScheme={activeColorScheme}
                  onDateClick={handleDateClick}
                />
                
                {/* Additional heatmap examples */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ContributionHeatmap
                    data={contributionData}
                    title="Last 14 Days"
                    subtitle="Two-week performance overview"
                    days={14}
                    colorScheme="blue"
                  />
                  <ContributionHeatmap
                    data={contributionData}
                    title="Recent Activity"
                    subtitle="Last 7 days"
                    days={7}
                    colorScheme="purple"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="combined" className="space-y-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Combined Components</h2>
                <p className="text-muted-foreground">
                  Both components working together in a real dashboard layout
                </p>
              </div>
              
              <div className="space-y-8">
                <ExamOverviewGrid
                  exams={exams}
                  onCreateExam={handleCreateExam}
                  onViewAnalytics={handleViewAnalytics}
                  onShareExam={handleShareExam}
                  onViewExam={handleViewExam}
                />
                
                <ContributionHeatmap
                  data={contributionData}
                  title="Exam Performance Trends"
                  subtitle="Understanding patterns in daily exam engagement"
                  colorScheme={activeColorScheme}
                  onDateClick={handleDateClick}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Technical Details */}
        <Card className="mt-12 p-6 bg-gradient-card border-0 shadow-medium">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Implementation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Responsive Grid Layout</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Uses CSS Grid with auto-fit and responsive breakpoints</li>
                  <li>• Two-up, one-down configuration on large screens</li>
                  <li>• Total Exams prominently spans 2 columns</li>
                  <li>• Mobile-first responsive design</li>
                  <li>• Consistent with shadcn/ui design system</li>
                  <li>• Full accessibility support with ARIA labels</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">30-Day Heatmap</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Left-to-right data flow (oldest to newest days)</li>
                  <li>• Daily breakdown within a 30-day period</li>
                  <li>• Multiple color schemes matching design system</li>
                  <li>• Hover states and interactive tooltips</li>
                  <li>• Best day highlighting with trend indicators</li>
                  <li>• Accessibility compliant with keyboard navigation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentDemo;