import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OverviewMetrics {
  totalFeedback: number;
  pending: number;
  inReview: number;
  planned: number;
  inProgress: number;
  completed: number;
  avgResponseTime: number;
  lastUpdated: Date;
}

interface FeedbackTrend {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  value: number;
}

/**
 * FeedbackOverviewPanel Component
 * Displays key metrics and analytics for the feedback system
 */
const FeedbackOverviewPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [trends, setTrends] = useState<FeedbackTrend[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Get all feedback
      const { data: allFeedback, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*');

      if (feedbackError) throw feedbackError;

      if (!allFeedback) return;

      // Count by status
      const statusCounts = {
        pending: allFeedback.filter(f => f.status === 'pending').length,
        inReview: allFeedback.filter(f => f.status === 'in-review').length,
        planned: allFeedback.filter(f => f.status === 'planned').length,
        inProgress: allFeedback.filter(f => f.status === 'in-progress').length,
        completed: allFeedback.filter(f => f.status === 'completed').length,
      };

      // Calculate 30-day trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendMap = new Map<string, number>();
      allFeedback.forEach(fb => {
        const date = new Date(fb.created_at).toISOString().split('T')[0];
        trendMap.set(date, (trendMap.get(date) || 0) + 1);
      });

      const trendArray = Array.from(trendMap.entries())
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .slice(-30)
        .map(([date, count]) => ({ date, count }));

      setTrends(trendArray);

      // Status distribution for pie chart
      const distribution = [
        { status: 'Pending', value: statusCounts.pending },
        { status: 'In Review', value: statusCounts.inReview },
        { status: 'Planned', value: statusCounts.planned },
        { status: 'In Progress', value: statusCounts.inProgress },
        { status: 'Completed', value: statusCounts.completed },
      ].filter(d => d.value > 0);

      setStatusDist(distribution);

      setMetrics({
        totalFeedback: allFeedback.length,
        ...statusCounts,
        avgResponseTime: Math.round(Math.random() * 24), // Placeholder calculation
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS = {
    'Pending': '#f59e0b',
    'In Review': '#3b82f6',
    'Planned': '#10b981',
    'In Progress': '#8b5cf6',
    'Completed': '#6ee7b7',
  };

  if (loading || !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white/60 border-blue-200/50 animate-pulse glass-effect-light">
            <CardContent className="pt-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Feedback */}
        <Card className="bg-white/80 border-blue-200/50 hover:border-blue-300/50 transition glass-effect-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{metrics.totalFeedback}</div>
            <p className="text-xs text-blue-500 mt-2">All submissions</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-amber-50/80 border-amber-300/50 hover:border-amber-400/50 transition glass-effect-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{metrics.pending}</div>
            <p className="text-xs text-amber-600/80 mt-2">{Math.round((metrics.pending / metrics.totalFeedback) * 100)}% of total</p>
          </CardContent>
        </Card>

        {/* In Review */}
        <Card className="bg-blue-50/80 border-blue-300/50 hover:border-blue-400/50 transition glass-effect-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{metrics.inReview}</div>
            <p className="text-xs text-blue-600/80 mt-2">{Math.round((metrics.inReview / metrics.totalFeedback) * 100)}% of total</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="bg-purple-50/80 border-purple-300/50 hover:border-purple-400/50 transition glass-effect-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{metrics.inProgress}</div>
            <p className="text-xs text-purple-600/80 mt-2">{Math.round((metrics.inProgress / metrics.totalFeedback) * 100)}% of total</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-emerald-50/80 border-emerald-300/50 hover:border-emerald-400/50 transition glass-effect-light">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{metrics.completed}</div>
            <p className="text-xs text-emerald-600/80 mt-2">{Math.round((metrics.completed / metrics.totalFeedback) * 100)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 bg-white/80 border-blue-200/50 glass-effect-light">
          <CardHeader>
            <CardTitle>30-Day Feedback Trend</CardTitle>
            <CardDescription>Feedback submissions over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(147, 197, 253, 0.3)" />
                  <XAxis dataKey="date" stroke="rgb(30, 64, 175)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgb(30, 64, 175)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgb(191, 219, 254)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="rgb(37, 99, 235)"
                    strokeWidth={2}
                    dot={{ fill: 'rgb(37, 99, 235)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-blue-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-white/80 border-blue-200/50 glass-effect-light">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current feedback status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, value }) => `${status}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDist.map((entry) => (
                      <Cell key={`cell-${entry.status}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgb(191, 219, 254)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-blue-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planned Status Card */}
      <Card className="bg-white/80 border-blue-200/50 glass-effect-light">
        <CardHeader>
          <CardTitle>Planned Feedback</CardTitle>
          <CardDescription>Items scheduled for future implementation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{metrics.planned}</div>
              <p className="text-blue-500 mt-1">Features planned for implementation</p>
            </div>
            <div className="bg-emerald-100/80 p-4 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackOverviewPanel;
