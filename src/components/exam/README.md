# Exam Components

This directory contains React components for exam-related UI elements, including a responsive grid layout and a 30-day performance heatmap.

## Components

### ExamOverviewGrid

A responsive grid layout component that arranges exam-related elements in a two-up, one-down configuration with "Total Exams" prominently displayed.

#### Features
- **Responsive Design**: Uses CSS Grid with mobile-first approach
- **Two-up, One-down Layout**: Total Exams card spans 2 columns on large screens
- **Accessibility**: Full ARIA label support and keyboard navigation
- **Consistent Styling**: Matches shadcn/ui design system
- **Interactive Elements**: Hover states, focus management, and click handlers

#### Usage

```tsx
import { ExamOverviewGrid } from '@/components/exam';

interface ExamData {
  id: string;
  title: string;
  description?: string;
  language: string;
  created_at: string;
  is_published: boolean;
  share_link?: string;
  question_count: number;
  attempt_count: number;
  average_score?: number;
  completion_rate?: number;
  status: 'draft' | 'published' | 'archived';
}

const MyComponent = () => {
  const handleCreateExam = () => {
    // Handle exam creation
  };

  const handleViewAnalytics = (examId: string) => {
    // Handle analytics view
  };

  const handleShareExam = (shareLink: string) => {
    // Handle exam sharing
  };

  const handleViewExam = (examId: string) => {
    // Handle exam viewing
  };

  return (
    <ExamOverviewGrid
      exams={examData}
      onCreateExam={handleCreateExam}
      onViewAnalytics={handleViewAnalytics}
      onShareExam={handleShareExam}
      onViewExam={handleViewExam}
    />
  );
};
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `exams` | `ExamData[]` | Array of exam data objects |
| `onCreateExam` | `() => void` | Callback when create exam button is clicked |
| `onViewAnalytics` | `(examId: string) => void` | Callback when analytics button is clicked |
| `onShareExam` | `(shareLink: string) => void` | Callback when share button is clicked |
| `onViewExam` | `(examId: string) => void` | Callback when view exam button is clicked |
| `className` | `string` | Additional CSS classes |

### ContributionHeatmap

A 30-day performance heatmap that displays daily exam data with left-to-right temporal progression over a specific number of days.

#### Features
- **Daily Breakdown**: Shows individual day performance within a specified timeframe
- **30-Day Default Display**: Shows last 30 days by default
- **Left-to-right Data Flow**: Temporal progression from earliest to most recent days
- **Multiple Color Schemes**: Green, blue, purple, and orange options
- **Responsive Design**: Adapts to all screen sizes
- **Interactive Tooltips**: Hover states with detailed daily information
- **Best Day Highlighting**: Automatically identifies and highlights best performing day
- **Accessibility**: Full keyboard navigation and screen reader support

#### Usage

```tsx
import { ContributionHeatmap } from '@/components/exam';

interface ContributionData {
  date: string; // ISO date string
  value: number; // Number of exams/completions for that date
  label?: string; // Optional accessibility label
}

const MyComponent = () => {
  const contributionData: ContributionData[] = [
    { date: '2024-01-15', value: 25, label: 'January 15th: 25 exams completed' },
    { date: '2024-01-16', value: 18, label: 'January 16th: 18 exams completed' },
    // ... more daily data
  ];

  const handleDateClick = (date: string, value: number) => {
    console.log(`Clicked ${date}: ${value} exams`);
  };

  return (
    <ContributionHeatmap
      data={contributionData}
      title="Exam Performance"
      subtitle="Daily exam performance over the last 30 days"
      colorScheme="green"
      onDateClick={handleDateClick}
    />
  );
};
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ContributionData[]` | - | Array of daily contribution data |
| `title` | `string` | "Exam Performance" | Heatmap title |
| `subtitle` | `string` | "Daily exam performance over the last 30 days" | Heatmap subtitle |
| `maxValue` | `number` | calculated | Maximum value for color scaling |
| `days` | `number` | 30 | Number of days to display |
| `cellSize` | `number` | 12 | Size of each square in pixels |
| `colorScheme` | `'green' \| 'blue' \| 'purple' \| 'orange'` | 'green' | Color scheme |
| `className` | `string` | - | Additional CSS classes |
| `onDateClick` | `(date: string, value: number) => void` | - | Click handler for date cells |

## Demo Page

A comprehensive demo page showcasing both components is available at `/ComponentDemo`. The demo includes:

- Individual component demonstrations
- Combined layout examples
- Interactive controls for color schemes and viewport sizes
- Technical implementation details
- Responsive behavior testing
- Multiple timeframe examples (7 days, 14 days, 30 days)

## Styling

Both components follow the project's design system:

- Uses CSS custom properties for colors
- Implements shadcn/ui component styling patterns
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Consistent shadows, gradients, and animations
- Dark mode support

## Accessibility

All components include:

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast color schemes
- Semantic HTML structure

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and tablet
- Touch-friendly interactions

## TypeScript

Both components are fully typed with TypeScript interfaces for better development experience and type safety.