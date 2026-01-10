import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Eye, Trash2, Send, ArrowLeft, Plus } from 'lucide-react';

interface ExamDraft {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const SettingsDrafts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<ExamDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('exams')
      .select('id, title, created_at, updated_at')
      .eq('teacher_id', user.id)
      .eq('is_published', false)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exam drafts',
        variant: 'destructive',
      });
    } else {
      setDrafts(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handlePublishDraft = async (id: string) => {
    const { error } = await supabase
      .from('exams')
      .update({ is_published: true })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish draft',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Exam published successfully',
      });
      fetchDrafts();
    }
  };

  const handleDeleteDraft = async (id: string) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      fetchDrafts();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              <span className="text-foreground">Exam</span>{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Drafts
              </span>
            </h1>
            <p className="text-lg text-primary-foreground">
              Manage your unpublished exam drafts
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''} found
            </p>
            <Button onClick={() => navigate('/create-exam')} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Exam
            </Button>
          </div>

          <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileEdit className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Your Drafts</CardTitle>
              <CardDescription className="text-muted-foreground">
                Review, edit, or publish your exam drafts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading drafts...</p>
                </div>
              ) : drafts.length === 0 ? (
                <div className="text-center py-12">
                  <FileEdit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No drafts found</h3>
                  <p className="text-muted-foreground mb-6">
                    Create a new exam to get started with your first draft.
                  </p>
                  <Button onClick={() => navigate('/create-exam')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Exam
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="flex items-center justify-between p-6 border border-border/50 rounded-xl bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">{draft.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(draft.created_at).toLocaleDateString()} •
                          Last updated: {new Date(draft.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/create-exam?edit=${draft.id}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/create-exam?edit=${draft.id}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <FileEdit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePublishDraft(draft.id)}
                          className="flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Publish
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrafts;