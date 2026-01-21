import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

/**
 * List of verified admin email addresses with exclusive access to the admin dashboard
 */
const ADMIN_EMAILS = [
  "albhyrytwamrwhybusiness@gmail.com",
  "oryno80@gmail.com"
];

/**
 * Interface for admin user with verified status
 */
export interface AdminUser extends User {
  isAdmin: boolean;
  verified: boolean;
}

/**
 * Log failed login attempts for security auditing
 * @param email - Email that attempted to access admin panel
 * @param reason - Reason for access denial
 */
export const logFailedAdminAttempt = async (email: string, reason: string) => {
  try {
    await supabase.from('admin_access_logs').insert([
      {
        email,
        status: 'failed',
        reason,
        ip_address: await getClientIpAddress(),
        user_agent: navigator.userAgent,
        attempted_at: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Failed to log admin access attempt:', error);
  }
};

/**
 * Log successful admin login for security auditing
 * @param email - Admin email that successfully logged in
 * @param userId - User ID of the admin
 */
export const logSuccessfulAdminLogin = async (email: string, userId: string) => {
  try {
    await supabase.from('admin_access_logs').insert([
      {
        user_id: userId,
        email,
        status: 'success',
        reason: 'Successful admin login',
        ip_address: await getClientIpAddress(),
        user_agent: navigator.userAgent,
        attempted_at: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Failed to log successful admin login:', error);
  }
};

/**
 * Get client IP address (for logging purposes)
 * Note: In production, this should be handled server-side for accuracy
 */
const getClientIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Verify if email is in the admin whitelist
 * @param email - Email to verify
 * @returns true if email is authorized, false otherwise
 */
export const isAuthorizedAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Verify admin access and return verification result
 * @param user - Authenticated user to verify
 * @returns Object with isAdmin flag and message
 */
export const verifyAdminAccess = (user: User | null): { isAdmin: boolean; message: string } => {
  if (!user) {
    return { isAdmin: false, message: "No authenticated user" };
  }

  const email = user.email;
  if (!email) {
    return { isAdmin: false, message: "User email not available" };
  }

  if (isAuthorizedAdminEmail(email)) {
    return { isAdmin: true, message: "Admin access granted" };
  }

  logFailedAdminAttempt(email, "Unauthorized email attempting admin access");
  return { isAdmin: false, message: "Access denied: Not an authorized admin" };
};

/**
 * Get list of authorized admin emails (for reference)
 */
export const getAuthorizedAdminEmails = (): string[] => {
  return [...ADMIN_EMAILS];
};
