import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook for subscribing to real-time exam attempts
 */
export function useRealTimeExamAttempts(
  onUpdate: (attempt: any) => void,
  filter?: { exam_id?: string; student_id?: string }
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const subscribe = async () => {
      channel = supabase.channel('exam_attempts');

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'exam_attempts',
            ...(filter?.exam_id && { filter: `exam_id=eq.${filter.exam_id}` })
          },
          (payload) => {
            onUpdate(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'exam_attempts',
            ...(filter?.exam_id && { filter: `exam_id=eq.${filter.exam_id}` })
          },
          (payload) => {
            onUpdate(payload.new);
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [onUpdate, filter?.exam_id]);
}

/**
 * Hook for subscribing to real-time security events
 */
export function useRealTimeSecurityEvents(
  onEvent: (event: any) => void,
  filter?: { exam_id?: string; attempt_id?: string }
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const subscribe = async () => {
      channel = supabase.channel('security_events');

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'security_events',
            ...(filter?.exam_id && { filter: `exam_id=eq.${filter.exam_id}` })
          },
          (payload) => {
            onEvent(payload.new);
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [onEvent, filter?.exam_id]);
}

/**
 * Hook for subscribing to real-time flagged attempts
 */
export function useRealTimeFlaggedAttempts(
  onFlagged: (attempt: any) => void,
  filter?: { exam_id?: string }
) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const subscribe = async () => {
      channel = supabase.channel('exam_flagged_attempts');

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'exam_flagged_attempts',
            ...(filter?.exam_id && { filter: `exam_id=eq.${filter.exam_id}` })
          },
          (payload) => {
            onFlagged(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'exam_flagged_attempts',
            ...(filter?.exam_id && { filter: `exam_id=eq.${filter.exam_id}` })
          },
          (payload) => {
            onFlagged(payload.new);
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [onFlagged, filter?.exam_id]);
}
