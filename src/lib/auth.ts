import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {
  profile?: {
    id: string;
    role: 'teacher' | 'student';
    full_name: string;
    avatar_url?: string;
  };
}

export const signUp = async (email: string, password: string, fullName: string, role: 'teacher' | 'student') => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
        role: role
      }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<{ user: AuthUser | null; session: Session | null }> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return { user: null, session: null };
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const user: AuthUser = {
    ...session.user,
    profile: profile ? {
      id: profile.id,
      role: profile.role as 'teacher' | 'student',
      full_name: profile.full_name || ''
    } : undefined
  };

  return { user, session };
};