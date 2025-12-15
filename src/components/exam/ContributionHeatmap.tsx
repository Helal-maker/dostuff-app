import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionData {
  date: string; // ISO date string
  value: number; // Number of exams/completions for that date
  label?: string; // Optional label for accessibility
}

interface ContributionHeatmapProps {
  data: ContributionData[];
  title?: string;
  subtitle?: string;
  maxValue?: number; // If not provided, will be calculated from data
  days?: number; // Number of days to display (default: 30)
  cellSize?: number; // Size of each square (default: 12)
  colorScheme?: 'green' | 'blue' | 'purple' | 'orange';
  className?: string;
  onDateClick?: (date: string, value: number) => void;
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  data,
  title = "Exam Performance",
  subtitle = "Daily exam performance over the last 30 days",
  maxValue,
  days = 30,
  cellSize = 12,
  colorScheme = 'green',
  className,
  onDateClick
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Color schemes that match the design system
  const colorSchemes = {
    green: {
      0: 'bg-muted',
      1: 'bg-green-100',
      2: 'bg-green-200',
      3: 'bg-green-300',
      4: 'bg-green-400',
      5: 'bg-green-500',
      hover: 'bg-green-600',
      text: 'text-green-600'
    },
    blue: {
      0: 'bg-muted',
      1: 'bg-blue-100',
      2: 'bg-blue-200',
      3: 'bg-blue-300',
      4: 'bg-blue-400',
      5: 'bg-blue-500',
      hover: 'bg-blue-600',
      text: 'text-blue-600'
    },
    purple: {
      0: 'bg-muted',
      1: 'bg-purple-100',
      2: 'bg-purple-200',
      3: 'bg-purple-300',
      4: 'bg-purple-400',
      5: 'bg-purple-500',
      hover: 'bg-purple-600',
      text: 'text-purple-600'
    },
    orange: {
      0: 'bg-muted',
      1: 'bg-orange-100',
      2: 'bg-orange-200',
      3: 'bg-orange-300',
      4: 'bg-orange-400',
      5: 'bg-orange-500',
      hover: 'bg-orange-600',
      text: 'text-orange-600'
    }
  };

  const colors = colorSchemes[colorScheme];

  // Create data map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.date, item.value);
    });
    return map;
  }, [data]);

  // Calculate max value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value), 1);

  // Generate date range for the specified number of days
  const generateDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));

    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Generate calendar grid data
  const calendarData = useMemo(() => {
    const dates = generateDateRange(days);
    const today = new Date();
    
    // Create week columns (left to right, oldest to newest)
    const weeksData = [];
    for (let weekIndex = 0; weekIndex < Math.ceil(days / 7); weekIndex++) {
      const week = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dateIndex = weekIndex * 7 + dayIndex;
        
        if (dateIndex < dates.length) {
          const date = dates[dateIndex];
          const dateString = date.toISOString().split('T')[0];
          const value = dataMap.get(dateString) || 0;
          
          week.push({
            date: dateString,
            dateObj: new Date(date),
            value,
            isFuture: date > today,
            isToday: date.toDateString() === today.toDateString(),
            intensity: value === 0 ? 0 : Math.ceil((value / calculatedMaxValue) * 5)
          });
        } else {
          // Add empty cells for remaining days
          week.push({
            date: '',
            dateObj: null,
            value: 0,
            isFuture: false,
            isToday: false,
            intensity: 0,
            isEmpty: true
          });
        }
      }
      weeksData.push(week);
    }

    return weeksData;
  }, [days, dataMap, calculatedMaxValue]);

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    
    const weeksInRange = Math.ceil(days / 7);
    for (let i = 0; i < weeksInRange; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      if (weekStart.getDate() <= 7) { // Show month label in first week of each month
        labels.push({
          weekIndex: i,
          month: weekStart.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    }
    
    return labels;
  }, [days]);

  // Day labels (Mon, Wed, Fri)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const visibleDayLabels = [1, 3, 5]; // Mon, Wed, Fri indices

  const handleCellClick = (dateString: string, value: number) => {
    if (onDateClick && dateString) {
      onDateClick(dateString, value);
    }
  };

  const handleCellHover = (dateString: string | null) => {
    setHoveredCell(dateString);
  };

  const getTotalContributions = () => {
    return data.reduce((acc, item) => acc + item.value, 0);
  };

  const getAveragePerDay = () => {
    if (days === 0) return 0;
    return Math.round(getTotalContributions() / days);
  };

  const getBestDay = () => {
    if (data.length === 0) return null;
    return data.reduce((best, current) => 
      current.value > best.value ? current : best
    );
  };

  const bestDay = getBestDay();

  return (
    <Card className={cn("p-6 bg-gradient-card border-0 shadow-medium", className)}>
      <CardHeader className="px-0 pt-0 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={cn("text-lg font-bold", colors.text)}>
                {getTotalContributions()}
              </div>
              <div className="text-xs text-muted-foreground">Total Exams</div>
            </div>
            <div className="text-center">
              <div className={cn("text-lg font-bold", colors.text)}>
                {getAveragePerDay()}
              </div>
              <div className="text-xs text-muted-foreground">Avg/Day</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <TooltipProvider>
          <div className="space-y-4">
            {/* Heatmap */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-max pb-2">
                {/* Day labels column */}
                <div className="flex flex-col gap-1 mr-2">
                  {visibleDayLabels.map(dayIndex => (
                    <div 
                      key={dayIndex}
                      className="text-xs text-muted-foreground text-right"
                      style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                    >
                      {dayLabels[dayIndex]}
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground text-right" style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}>
                    Sun
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="flex gap-1">
                  {/* Month labels */}
                  <div className="flex flex-col gap-1 mb-1">
                    {monthLabels.map(({ weekIndex, month }) => (
                      <div
                        key={`${weekIndex}-${month}`}
                        className="text-xs text-muted-foreground text-center"
                        style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                      >
                        {month}
                      </div>
                    ))}
                    {/* Add empty cells for day labels alignment */}
                    {visibleDayLabels.map(dayIndex => (
                      <div key={`empty-${dayIndex}`} style={{ height: `${cellSize}px` }} />
                    ))}
                    <div style={{ height: `${cellSize}px` }} />
                  </div>

                  {/* Heatmap squares */}
                  {calendarData.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCellClick(day.date, day.value)}
                              onMouseEnter={() => handleCellHover(day.date)}
                              onMouseLeave={() => handleCellHover(null)}
                              className={cn(
                                "rounded-sm transition-all duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "hover:scale-110 hover:z-10",
                                day.isEmpty ? "opacity-0" : colors[day.intensity as keyof typeof colors] || colors[0],
                                day.isToday && !day.isEmpty && "ring-2 ring-primary/50",
                                day.isFuture && !day.isEmpty && "opacity-30 cursor-not-allowed",
                                hoveredCell === day.date && !day.isEmpty && colors.hover
                              )}
                              style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`
                              }}
                              disabled={day.isFuture || day.isEmpty}
                              aria-label={day.isEmpty ? "" : `${day.date}: ${day.value} exam${day.value !== 1 ? 's' : ''} completed`}
                            />
                          </TooltipTrigger>
                          {!day.isEmpty && (
                            <TooltipContent>
                              <div className="text-center">
                                <div className="font-medium">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {day.value} exam{day.value !== 1 ? 's' : ''} completed
                                </div>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Best Day Highlight */}
            {bestDay && (
              <div className="flex items-center justify-center pt-4 border-t border-border">
                <Badge variant="outline" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Best Day: {new Date(bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({bestDay.value} exams)
                </Badge>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "rounded-sm",
                        colors[level as keyof typeof colors] || colors[0]
                      )}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">More</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Left-to-right: Oldest → Recent
                </Badge>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default ContributionHeatmap;