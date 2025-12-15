import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Users,
  HelpCircle,
  MessageSquare,
  Calendar,
  Target,
  Trophy,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  onClick,
  active = false,
  disabled = false
}) => {
  const isMobile = useIsMobile();

  return (
    <Card
      className={cn(
        // Base styles
        'bg-gradient-card border-0 shadow-strong transition-all duration-200',
        // Mobile optimizations
        isMobile && 'p-4 rounded-xl',
        !isMobile && 'p-6',
        // Touch optimizations
        isMobile && onClick && !disabled && 'active:scale-[0.98] active:bg-muted/50',
        // Interactive states
        onClick && !disabled && 'cursor-pointer hover:shadow-glow',
        active && 'ring-2 ring-primary ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Card>
  );
};

interface MobileStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MobileStatCard: React.FC<MobileStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <MobileCard className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-muted-foreground truncate",
            isMobile ? "text-sm" : "text-sm"
          )}>
            {title}
          </p>
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-bold text-foreground",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              {value}
            </p>
            {trend && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                trend.isPositive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </MobileCard>
  );
};

interface MobileExamCardProps {
  title: string;
  description?: string;
  status: 'published' | 'draft' | 'in-progress';
  score?: number;
  date: string;
  language?: string;
  attempts?: number;
  questions?: number;
  onClick?: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export const MobileExamCard: React.FC<MobileExamCardProps> = ({
  title,
  description,
  status,
  score,
  date,
  language,
  attempts,
  questions,
  onClick,
  onActionClick,
  actionLabel = 'View',
  className
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-muted/10 text-muted-foreground';
      case 'in-progress':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <MobileCard onClick={onClick} className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground truncate",
              isMobile ? "text-base" : "text-lg"
            )}>
              {title}
            </h3>
            {description && (
              <p className={cn(
                "text-muted-foreground mt-1 line-clamp-2",
                isMobile ? "text-sm" : "text-sm"
              )}>
                {description}
              </p>
            )}
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1",
            getStatusColor(status)
          )}>
            {status === 'published' && <CheckCircle className="w-3 h-3" />}
            {status === 'draft' && <XCircle className="w-3 h-3" />}
            {status === 'in-progress' && <Target className="w-3 h-3" />}
            <span>{status === 'in-progress' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </div>
        </div>

        {/* Stats Row */}
        {(score !== undefined || attempts !== undefined || questions !== undefined) && (
          <div className="grid grid-cols-3 gap-4">
            {score !== undefined && (
              <div className="text-center">
                <p className={cn("text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1")}>
                  <Trophy className="w-3 h-3" />
                  Score
                </p>
                <p className={cn("font-bold", getScoreColor(score))}>
                  {score}%
                </p>
              </div>
            )}
            {attempts !== undefined && (
              <div className="text-center">
                <p className={cn("text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1")}>
                  <Users className="w-3 h-3" />
                  Attempts
                </p>
                <p className={cn("font-bold text-foreground")}>{attempts}</p>
              </div>
            )}
            {questions !== undefined && (
              <div className="text-center">
                <p className={cn("text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1")}>
                  <HelpCircle className="w-3 h-3" />
                  Questions
                </p>
                <p className={cn("font-bold text-foreground")}>{questions}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(date).toLocaleDateString()}
              </span>
            )}
            {language && (
              <span className="flex items-center gap-1 capitalize">
                <MessageSquare className="w-3 h-3" />
                {language}
              </span>
            )}
          </div>
          
          {onActionClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActionClick();
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </MobileCard>
  );
};

export default MobileCard;