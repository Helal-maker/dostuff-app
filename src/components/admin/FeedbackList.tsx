import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

interface FeedbackListProps {
  onSelectFeedback: (feedback: Feedback) => void;
}

/**
 * FeedbackList Component
 * Displays feedback submissions in a sortable, paginated table with advanced filtering
 */
const FeedbackList: React.FC<FeedbackListProps> = ({ onSelectFeedback }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  useEffect(() => {
    loadFeedbacks();
  }, [statusFilter, categoryFilter, dateRange, sortBy, sortOrder]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);

      let query = supabase.from('feedbacks').select('*');

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      // Apply date range filter
      const now = new Date();
      if (dateRange !== 'all') {
        const dateThreshold = new Date();
        if (dateRange === 'today') {
          dateThreshold.setHours(0, 0, 0, 0);
        } else if (dateRange === 'week') {
          dateThreshold.setDate(dateThreshold.getDate() - 7);
        } else if (dateRange === 'month') {
          dateThreshold.setMonth(dateThreshold.getMonth() - 1);
        }
        query = query.gte('created_at', dateThreshold.toISOString());
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      setFeedbacks(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  // Filter by search term
  const filteredFeedbacks = feedbacks.filter(fb => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fb.title.toLowerCase().includes(searchLower) ||
      fb.description.toLowerCase().includes(searchLower) ||
      fb.user_name.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      'in-review': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'planned': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      'in-progress': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'completed': 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'bug': 'bg-red-500/10 text-red-300',
      'feature': 'bg-green-500/10 text-green-300',
      'improvement': 'bg-blue-500/10 text-blue-300',
      'general': 'bg-slate-500/10 text-slate-300'
    };
    return colors[category] || 'bg-slate-500/10 text-slate-300';
  };

  return (
    <Card className="bg-white/80 border-blue-200/50 glass-effect-light">
      <CardHeader>
        <CardTitle>Feedback Management</CardTitle>
        <CardDescription>
          {filteredFeedbacks.length} feedback items {searchTerm && `matching "${searchTerm}"`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
              placeholder="Search by title, description, or user..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-blue-200 text-blue-800 placeholder:text-blue-400"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-blue-200 text-blue-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white border-blue-200 text-blue-800">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="bg-white border-blue-200 text-blue-800">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-blue-500">
              <p>No feedback found matching your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/50 hover:bg-blue-50/50">
                  <TableHead className="text-blue-600 cursor-pointer" onClick={() => {
                    if (sortBy === 'created_at') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else setSortBy('created_at');
                  }}>
                    Submitted
                  </TableHead>
                  <TableHead className="text-blue-600">User</TableHead>
                  <TableHead className="text-blue-600">Title</TableHead>
                  <TableHead className="text-blue-600">Category</TableHead>
                  <TableHead className="text-blue-600">Status</TableHead>
                  <TableHead className="text-blue-600">Votes</TableHead>
                  <TableHead className="text-blue-600">Comments</TableHead>
                  <TableHead className="text-blue-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id} className="border-blue-200/50 hover:bg-blue-50/50 transition">
                    <TableCell className="text-blue-600 text-sm">
                      {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-blue-600 text-sm">{feedback.user_name}</TableCell>
                    <TableCell className="text-blue-800 font-medium truncate max-w-xs">
                      {feedback.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-semibold ${getCategoryColor(feedback.category)}`}>
                        {feedback.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-semibold ${getStatusColor(feedback.status)}`}>
                        {feedback.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-600 text-sm">{feedback.upvote_count}</TableCell>
                    <TableCell className="text-blue-600 text-sm">{feedback.comment_count}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectFeedback(feedback)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50/50"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-blue-500 text-sm">
              Page {currentPage} of {totalPages} ({filteredFeedbacks.length} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-blue-200 hover:bg-blue-50/50 text-blue-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-blue-200 hover:bg-blue-50/50 text-blue-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackList;
