import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionData {
  date: string; // ISO date string
  value: number; // Number of exams/completions for that date
  label?: string; // Optional label for accessibility
}

interface ContributionHeatmapProps {
  data: ContributionData[];
  className?: string;
  onDateClick?: (date: string, value: number) => void;
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({
  data,
  className,
  onDateClick
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // GitHub-style color scheme (using exact GitHub colors)
  const colorSchemes = {
    0: 'bg-gray-100 dark:bg-gray-700',
    1: 'bg-[#9be9a8]',
    2: 'bg-[#40c463]',
    3: 'bg-[#30a14e]',
    4: 'bg-[#216e39]',
    5: 'bg-[#216e39]',
    hover: 'bg-[#115e29]'
  };

  // Create data map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(item => {
      map.set(item.date, item.value);
    });
    return map;
  }, [data]);

  // Generate calendar grid data for current month only (3 lines with bigger dots)
  const calendarData = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Get first day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Get last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const totalDaysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
    
    // Group days into 3 lines
    const daysPerLine = Math.ceil(totalDaysInMonth / 3);
    const linesData = [];
    
    for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
      const line = [];
      const startDay = lineIndex * daysPerLine + 1;
      const endDay = Math.min((lineIndex + 1) * daysPerLine, totalDaysInMonth);
      
      for (let dayOfMonth = startDay; dayOfMonth <= endDay; dayOfMonth++) {
        const date = new Date(currentYear, currentMonth, dayOfMonth);
        const dateString = date.toISOString().split('T')[0];
        const value = dataMap.get(dateString) || 0;
        
        line.push({
          date: dateString,
          dateObj: date,
          value,
          isFuture: date > today,
          isToday: date.toDateString() === today.toDateString(),
          intensity: value === 0 ? 0 : Math.min(5, Math.ceil((value / Math.max(...data.map(d => d.value), 1)) * 5))
        });
      }
      
      // Fill remaining cells with empty data if needed
      const remainingCells = daysPerLine - line.length;
      for (let i = 0; i < remainingCells; i++) {
        line.push({
          date: '',
          dateObj: null,
          value: 0,
          isFuture: false,
          isToday: false,
          intensity: 0,
          isEmpty: true
        });
      }
      
      linesData.push(line);
    }

    return linesData;
  }, [dataMap, data]);

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

  return (
    <Card className={cn("p-4 bg-white border border-border", className)}>
      <CardHeader className="px-0 pt-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            Exam Contributions
          </CardTitle>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <TooltipProvider>
          <div className="space-y-3">
            {/* Heatmap */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 min-w-max pb-2">
                {/* Calendar grid */}
                <div className="flex flex-col gap-2">
                  {/* Heatmap squares - 3 lines with bigger dots */}
                  {calendarData.map((line, lineIndex) => (
                    <div key={lineIndex} className="flex gap-1">
                      {line.map((day, dayIndex) => (
                        <Tooltip key={`${lineIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleCellClick(day.date, day.value)}
                              onMouseEnter={() => handleCellHover(day.date)}
                              onMouseLeave={() => handleCellHover(null)}
                              className={cn(
                                "rounded-sm transition-colors duration-200",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "hover:opacity-80",
                                day.isEmpty ? "opacity-0" : colorSchemes[day.intensity as keyof typeof colorSchemes] || colorSchemes[0],
                                day.isToday && !day.isEmpty && "bg-[#ff69b4] ring-2 ring-purple-600",
                                day.isFuture && !day.isEmpty && "opacity-50 cursor-not-allowed",
                                hoveredCell === day.date && !day.isEmpty && colorSchemes.hover
                              )}
                              style={{
                                width: "16px",
                                height: "16px",
                                border: "1px solid rgba(27, 31, 35, 0.06) dark:border-gray-600"
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

            {/* Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "rounded-sm",
                        colorSchemes[level as keyof typeof colorSchemes] || colorSchemes[0]
                      )}
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "1px solid rgba(27, 31, 35, 0.06) dark:border-gray-600"
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default ContributionHeatmap;