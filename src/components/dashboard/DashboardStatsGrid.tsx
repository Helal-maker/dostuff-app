import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Book,
  Users,
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Award,
  BookOpen
} from "lucide-react";

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  colorScheme?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  size?: 'default' | 'large';
  className?: string;
}

interface DashboardStatsGridProps {
  stats: StatItem[];
  className?: string;
  layout?: 'two-up-one-down' | 'three-up' | 'custom';
}

const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  stats,
  className,
  layout = 'two-up-one-down'
}) => {
  const getColorSchemeClasses = (colorScheme?: string) => {
    const schemes = {
      primary: {
        bg: 'bg-primary/10',
        hoverBg: 'group-hover:bg-primary/20',
        icon: 'text-primary',
        dot: 'bg-primary'
      },
      success: {
        bg: 'bg-success/10',
        hoverBg: 'group-hover:bg-success/20',
        icon: 'text-success',
        dot: 'bg-success'
      },
      warning: {
        bg: 'bg-warning/10',
        hoverBg: 'group-hover:bg-warning/20',
        icon: 'text-warning',
        dot: 'bg-warning'
      },
      destructive: {
        bg: 'bg-destructive/10',
        hoverBg: 'group-hover:bg-destructive/20',
        icon: 'text-destructive',
        dot: 'bg-destructive'
      },
      info: {
        bg: 'bg-blue-500/10',
        hoverBg: 'group-hover:bg-blue-500/20',
        icon: 'text-blue-600',
        dot: 'bg-blue-500'
      }
    };
    return schemes[colorScheme as keyof typeof schemes] || schemes.primary;
  };

  const getGridClasses = () => {
    switch (layout) {
      case 'two-up-one-down':
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr';
      case 'three-up':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'custom':
        return className || '';
      default:
        return 'grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr';
    }
  };

  const renderStatCard = (stat: StatItem, index: number) => {
    const colors = getColorSchemeClasses(stat.colorScheme);
    const isLarge = stat.size === 'large';
    const isSpanningCard = layout === 'two-up-one-down' && index === 0 && isLarge;

    return (
      <Card
        key={stat.id}
        className={cn(
          "p-6 bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-300 group",
          "focus-within:ring-2 focus-within:ring-primary/50",
          isSpanningCard && "lg:col-span-2",
          stat.className
        )}
      >
        <div className={cn(
          "flex items-center justify-between h-full",
          isLarge ? "gap-6" : "gap-4"
        )}>
          <div className="flex items-center gap-4 flex-1">
            <div className={cn(
              "rounded-lg flex items-center justify-center transition-colors",
              isLarge ? "w-16 h-16" : "w-12 h-12",
              colors.bg,
              colors.hoverBg
            )}>
              <div className={cn(isLarge ? "w-8 h-8" : "w-6 h-6", colors.icon)}>
                {stat.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1 truncate">
                {stat.title}
              </p>
              <p className={cn(
                "font-bold text-foreground truncate",
                isLarge ? "text-4xl" : "text-2xl"
              )}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
              {stat.trend && (
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    stat.trend.isPositive !== false ? colors.dot : 'bg-destructive'
                  )}></div>
                  <span className="text-xs text-muted-foreground">
                    {stat.trend.isPositive !== false ? '+' : ''}{stat.trend.value}% {stat.trend.label}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {isLarge && (
            <div className="hidden lg:flex flex-col items-end gap-2">
              <TrendingUp className="w-8 h-8 text-primary/50" />
              <p className="text-xs text-muted-foreground">Overview</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderGridLayout = () => {
    switch (layout) {
      case 'two-up-one-down':
        return (
          <div className={getGridClasses()}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </div>
        );
      
      case 'three-up':
        return (
          <div className={getGridClasses()}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </div>
        );
      
      case 'custom':
        return (
          <div className={getGridClasses()}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </div>
        );
      
      default:
        return (
          <div className={getGridClasses()}>
            {stats.map((stat, index) => renderStatCard(stat, index))}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderGridLayout()}
    </div>
  );
};

// Pre-defined stat configurations for common use cases
export const createExamStats = (data: {
  totalStudents: number;
  activeExams: number;
  publishedExams: number;
  totalAttempts: number;
}): StatItem[] => {
  return [
    {
      id: 'total-students',
      title: 'Total Students',
      value: data.totalStudents,
      subtitle: 'Unique participants',
      icon: <Users className="w-full h-full" />,
      colorScheme: 'primary',
      size: 'large',
    },
    {
      id: 'active-exams',
      title: 'Active Exams',
      value: data.activeExams,
      subtitle: 'With student attempts',
      icon: <BookOpen className="w-full h-full" />,
      colorScheme: 'success',
    },
    {
      id: 'published-exams',
      title: 'Published',
      value: data.publishedExams,
      subtitle: 'Live exams',
      icon: <CheckCircle className="w-full h-full" />,
      colorScheme: 'warning',
    },
    {
      id: 'total-attempts',
      title: 'Total Attempts',
      value: data.totalAttempts,
      subtitle: 'Student submissions',
      icon: <BarChart3 className="w-full h-full" />,
      colorScheme: 'info',
    }
  ];
};

export const createStudentStats = (data: {
  examsTaken: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  totalTimeSpent: string;
}): StatItem[] => {
  return [
    {
      id: 'exams-taken',
      title: 'Exams Taken',
      value: data.examsTaken,
      subtitle: `${data.currentStreak} day streak`,
      icon: <BookOpen className="w-full h-full" />,
      colorScheme: 'primary',
      size: 'large',
      trend: {
        value: data.currentStreak,
        label: 'day streak',
        isPositive: data.currentStreak > 0
      }
    },
    {
      id: 'average-score',
      title: 'Average Score',
      value: `${data.averageScore}%`,
      subtitle: 'Across all attempts',
      icon: <Trophy className="w-full h-full" />,
      colorScheme: data.averageScore >= 80 ? 'success' : data.averageScore >= 60 ? 'warning' : 'destructive',
      trend: {
        value: data.averageScore,
        label: 'performance',
        isPositive: data.averageScore >= 70
      }
    },
    {
      id: 'best-score',
      title: 'Best Score',
      value: `${data.bestScore}%`,
      subtitle: `Time spent: ${data.totalTimeSpent}`,
      icon: <Award className="w-full h-full" />,
      colorScheme: 'success',
      trend: {
        value: data.bestScore,
        label: 'personal best',
        isPositive: true
      }
    }
  ];
};

export default DashboardStatsGrid;