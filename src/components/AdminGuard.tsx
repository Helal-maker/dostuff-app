import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { verifyAdminAccess, logFailedAdminAttempt, logSuccessfulAdminLogin } from '@/lib/admin-auth';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard Component
 * Protects admin routes by verifying that only authorized email addresses can access them
 * Logs all access attempts (both successful and failed) for security auditing
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run verification once after loading is complete
    if (loading || hasChecked) {
      return;
    }

    const verifyAccess = async () => {
      setIsCheckingAccess(true);

      // Check if user is authenticated
      if (!isAuthenticated) {
        setError('Please log in to access the admin dashboard');
        setIsVerified(false);
        setIsCheckingAccess(false);
        setHasChecked(true);
        // Redirect to auth after brief delay
        setTimeout(() => navigate('/auth'), 2000);
        return;
      }

      // Verify admin access
      const verification = verifyAdminAccess(user);

      if (verification.isAdmin) {
        // Log successful admin login
        if (user?.id && user?.email) {
          await logSuccessfulAdminLogin(user.email, user.id);
        }
        setIsVerified(true);
        setError(null);
        setIsCheckingAccess(false);
      } else {
        // Log failed attempt
        if (user?.email) {
          await logFailedAdminAttempt(user.email, 'Unauthorized email attempting admin access');
        }
        setError(verification.message);
        setIsVerified(false);
        setIsCheckingAccess(false);
        // Redirect to home after showing message
        setTimeout(() => navigate('/'), 3000);
      }

      setHasChecked(true);
    };

    verifyAccess();
  }, [user, isAuthenticated, loading, navigate, hasChecked]);

  // Loading state
  if (loading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Error state - show alert and prevent access
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <h3 className="font-semibold mb-2">Access Denied</h3>
              <p>{error || 'You do not have permission to access the admin dashboard.'}</p>
              <p className="text-xs mt-2 text-slate-400">
                {!isAuthenticated && 'Redirecting to login...'}
                {isAuthenticated && 'Redirecting to home...'}
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Verified admin - render children
  return <>{children}</>;
};

export default AdminGuard;
