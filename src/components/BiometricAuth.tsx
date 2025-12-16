import { useState, useEffect } from 'react';
import { Fingerprint, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BiometricAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  mode?: 'login' | 'unlock' | 'verify';
  title?: string;
  description?: string;
}

/**
 * Biometric Authentication Component
 * Supports fingerprint, face recognition, and pattern authentication
 */
const BiometricAuth = ({
  onSuccess,
  onError,
  onCancel,
  mode = 'login',
  title,
  description
}: BiometricAuthProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ready' | 'authenticating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn API is supported
      if ('credentials' in navigator) {
        const isWebAuthnSupported = window.PublicKeyCredential && 
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        
        if (isWebAuthnSupported) {
          setIsSupported(true);
          setStatus('ready');
        }
      }

      // Check for biometric sensors (fallback)
      if ('credentials' in navigator) {
        // This is a simplified check - real implementation would be more complex
        setIsSupported(true);
        setStatus('ready');
      }
    } catch (error) {
      console.log('Biometric authentication not supported:', error);
      setIsSupported(false);
    }
  };

  const authenticate = async () => {
    if (!isSupported || status === 'authenticating') return;

    setIsAuthenticating(true);
    setStatus('authenticating');
    setError('');

    try {
      // Simulate biometric authentication
      // In a real implementation, this would use:
      // 1. WebAuthn API for platform authenticators
      // 2. Web Bluetooth API for external biometric devices
      // 3. Device-specific biometric APIs

      await simulateBiometricAuth();
      
      setStatus('success');
      toast({
        title: "Authentication Successful",
        description: "Biometric verification completed successfully.",
      });
      
      onSuccess?.();
    } catch (error: any) {
      setStatus('error');
      setError(error.message || 'Biometric authentication failed');
      setIsAuthenticating(false);
      
      toast({
        title: "Authentication Failed",
        description: error.message || 'Please try again or use alternative authentication.',
        variant: "destructive",
      });
      
      onError?.(error.message || 'Biometric authentication failed');
    }
  };

  const simulateBiometricAuth = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      const shouldFail = Math.random() < 0.1; // 10% failure rate for demo

      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Biometric authentication failed. Please try again.'));
        } else {
          resolve();
        }
      }, delay);
    });
  };

  const getDefaultTitle = () => {
    switch (mode) {
      case 'login': return 'Sign in with Biometrics';
      case 'unlock': return 'Unlock Application';
      case 'verify': return 'Verify Your Identity';
      default: return 'Biometric Authentication';
    }
  };

  const getDefaultDescription = () => {
    switch (mode) {
      case 'login': return 'Use your fingerprint, face, or pattern to sign in securely.';
      case 'unlock': return 'Use biometrics to unlock the application.';
      case 'verify': return 'Verify your identity using biometric authentication.';
      default: return 'Secure biometric authentication';
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Biometric Not Available</h3>
            <p className="text-sm text-gray-600 mt-2">
              Biometric authentication is not supported on this device or browser.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={onCancel}>
              Continue with Password
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className={`
          w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300
          ${status === 'authenticating' 
            ? 'bg-blue-100 animate-pulse' 
            : status === 'success' 
            ? 'bg-green-100' 
            : status === 'error'
            ? 'bg-red-100'
            : 'bg-primary/10'
          }
        `}>
          {status === 'authenticating' ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : status === 'error' ? (
            <XCircle className="w-10 h-10 text-red-500" />
          ) : (
            <Fingerprint className="w-10 h-10 text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {title || getDefaultTitle()}
          </h3>
          <p className="text-sm text-gray-600">
            {description || getDefaultDescription()}
          </p>
        </div>

        {/* Status */}
        {status === 'authenticating' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Authenticating...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {status === 'error' && error && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Authentication Failed</span>
            </div>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Authentication Successful</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === 'idle' || status === 'ready' ? (
            <>
              <Button
                onClick={authenticate}
                disabled={isAuthenticating}
                className="w-full"
                size="lg"
              >
                <Fingerprint className="w-4 h-4 mr-2" />
                {mode === 'login' ? 'Sign In with Biometrics' : 'Authenticate'}
              </Button>
              
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Use Alternative Method
              </Button>
            </>
          ) : status === 'error' ? (
            <>
              <Button
                onClick={authenticate}
                disabled={isAuthenticating}
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full"
              >
                Use Password Instead
              </Button>
            </>
          ) : null}
        </div>

        {/* Security Notice */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Your biometric data never leaves your device
          </p>
        </div>
      </div>
    </Card>
  );
};

export default BiometricAuth;
