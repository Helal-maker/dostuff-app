# Dashboard Components

This directory contains responsive dashboard components for the DoStuff exam platform, featuring modern grid layouts and accessibility-first design.

## Components

### DashboardStatsGrid

A highly customizable responsive grid component for displaying dashboard statistics with multiple layout options and accessibility features.

#### Features

- **Responsive Design**: Adapts to different screen sizes with CSS Grid
- **Multiple Layout Options**: 
  - `two-up-one-down`: Two cards side-by-side on large screens, third card spans full width below
  - `three-up`: Three equal cards in a row
  - `custom`: Use custom grid classes
- **Accessibility**: Full ARIA support, keyboard navigation, focus management
- **Consistent Styling**: Integrates with shadcn/ui design system
- **Color Schemes**: Multiple color options (primary, success, warning, destructive, info)
- **Size Variants**: Default and large sizes for different emphasis levels
- **Trend Indicators**: Visual feedback for performance metrics

#### Usage

```tsx
import DashboardStatsGrid, { createExamStats, createStudentStats } from "@/components/dashboard/DashboardStatsGrid";

// Basic usage
<DashboardStatsGrid
  stats={[
    {
      id: 'total-exams',
      title: 'Total Exams',
      value: 24,
      icon: <Book className="w-full h-full" />,
      colorScheme: 'primary',
      size: 'large'
    }
  ]}
  layout="two-up-one-down"
/>

// Using helper functions
<DashboardStatsGrid
  stats={createExamStats({
    totalExams: 24,
    publishedExams: 18,
    draftExams: 6,
    totalAttempts: 156,
    averageScore: 78
  })}
  layout="two-up-one-down"
/>
```

#### Layout Configurations

**Two-up, One-down (Default)**
- Large screens: First two cards side-by-side, third card spans full width below
- Mobile: All cards stack vertically
- Ideal for: Primary dashboard metrics with one main metric and two supporting metrics

**Three-up**
- All screen sizes: Three equal cards in a row
- Mobile: Stacks to single column
- Ideal for: Balanced metric displays

**Custom**
- Provide your own grid classes via `className`
- Full control over responsive behavior

#### Accessibility Features

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color combinations
- **Responsive Text**: Scales appropriately across devices
- **Semantic HTML**: Proper heading hierarchy and landmark regions

#### API

**StatItem Interface**
```typescript
interface StatItem {
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
```

**Props**
```typescript
interface DashboardStatsGridProps {
  stats: StatItem[];
  className?: string;
  layout?: 'two-up-one-down' | 'three-up' | 'custom';
}
```

## GitHub Heatmap

Modified contribution heatmap component with improved left-to-right temporal progression.

### Changes Made

- **Direction**: Now flows from oldest (left) to newest (right)
- **Accessibility**: Enhanced ARIA labels and keyboard navigation
- **Responsive**: Improved mobile experience with horizontal scrolling
- **Consistency**: Matches dashboard component styling

## Integration with Existing Components

Both components are designed to integrate seamlessly with:

- **TeacherDashboard**: Uses `createExamStats` for consistent exam metrics
- **StudentDashboard**: Uses `createStudentStats` for progress tracking
- **ExamOverviewGrid**: Maintains design system consistency
- **Mobile Components**: Responsive behavior across all device sizes

## Responsive Breakpoints

- **Mobile**: < 768px - Single column layout
- **Tablet**: 768px - 1024px - Two columns where appropriate
- **Desktop**: > 1024px - Full multi-column layouts

## Design System Compliance

- Uses shadcn/ui component library
- Follows established color palette and spacing
- Implements consistent shadow and border radius
- Maintains typography hierarchy
- Supports both light and dark themes

## Performance Considerations

- Uses `React.memo` for optimal re-rendering
- Efficient CSS Grid implementation
- Minimal DOM manipulation
- Optimized for mobile devices
- Lazy loading compatible

## Browser Support

- Modern browsers with CSS Grid support
- IE11+ with polyfills
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach