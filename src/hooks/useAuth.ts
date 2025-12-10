import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser extends User {
  profile?: {
    id: string;
    role: 'teacher' | 'student';
    full_name: string;
    avatar_url?: string;
    onboarding_completed?: boolean;
    experience_years?: number;
    graduation_year?: number;
    teacher_type?: string;
    subject?: string;
    certificate_type?: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserWithProfile = async (authUser: User): Promise<AuthUser> => {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    // Fetch user role from user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .single();

    return {
      ...authUser,
      profile: profile ? {
        id: profile.id,
        role: (roleData?.role || profile.role) as 'teacher' | 'student',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url,
        onboarding_completed: profile.onboarding_completed,
        experience_years: profile.experience_years,
        graduation_year: profile.graduation_year,
        teacher_type: profile.teacher_type,
        subject: profile.subject,
        certificate_type: profile.certificate_type
      } : undefined
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer the profile fetch to avoid deadlock
          setTimeout(async () => {
            const authUser = await fetchUserWithProfile(session.user);
            setUser(authUser);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const authUser = await fetchUserWithProfile(session.user);
        setUser(authUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isTeacher: user?.profile?.role === 'teacher',
    isStudent: user?.profile?.role === 'student',
    needsOnboarding: user?.profile?.role === 'teacher' && !user?.profile?.onboarding_completed
  };
};