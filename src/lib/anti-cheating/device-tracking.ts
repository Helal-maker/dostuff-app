/**
 * IP Address & Device Tracking
 * Logs student IP address and device info to detect multiple students on same device
 * Requires backend API to fetch IP address
 */

interface DeviceInfo {
  ipAddress: string | null;
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  language: string;
  timestamp: number;
}

interface IPAddressResponse {
  ip: string;
  country?: string;
  city?: string;
  isp?: string;
}

/**
 * Fetch student's IP address from public IP API
 * Multiple fallback options available
 */
export async function fetchStudentIPAddress(): Promise<string | null> {
  // Try multiple IP detection services
  const ipApis = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://ip-api.com/json/',
    'https://ipapi.co/json/'
  ];

  for (const api of ipApis) {
    try {
      const response = await fetch(api, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;

      const data: any = await response.json();
      return data.ip || data.query || null;
    } catch (error) {
      // Try next API
      continue;
    }
  }

  console.warn('Failed to fetch IP address from all services');
  return null;
}

/**
 * Get comprehensive device information
 */
export function getDeviceInfo(): DeviceInfo {
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language || (navigator as any).userLanguage;
  const platform = navigator.platform;

  return {
    ipAddress: null, // Will be fetched separately
    userAgent: navigator.userAgent,
    platform,
    screenResolution,
    timezone,
    language,
    timestamp: Date.now()
  };
}

/**
 * Get browser fingerprint (device identifier)
 * Helps detect if multiple students are using same device
 * @param deviceInfo Optional device info object. If not provided, will call getDeviceInfo()
 */
export function generateDeviceFingerprint(deviceInfo?: Record<string, any>): string {
  const info = deviceInfo || getDeviceInfo();
  
  // Combine multiple factors to create a fingerprint
  const fingerprint = [
    info.userAgent,
    info.platform,
    info.screenResolution,
    info.timezone,
    info.language,
    navigator.hardwareConcurrency, // CPU cores
    (navigator as any).deviceMemory || 'unknown', // RAM (may not be available)
    navigator.maxTouchPoints, // Touch capability
    (screen as any).colorDepth // Screen colors
  ].join('|');

  // DJB2 hash function for consistent fingerprinting
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Log exam attempt with device information
 * Should be called when student starts an exam
 */
export async function logExamAttemptDevice(
  examId: string,
  userId: string,
  supabaseClient?: any
): Promise<DeviceInfo | null> {
  try {
    const ipAddress = await fetchStudentIPAddress();
    const deviceInfo = getDeviceInfo();
    const fingerprint = generateDeviceFingerprint();

    const fullDeviceInfo = {
      ...deviceInfo,
      ipAddress,
      fingerprint
    };

    // Log to Supabase if client provided
    if (supabaseClient) {
      await supabaseClient
        .from('exam_attempt_logs')
        .insert({
          exam_id: examId,
          user_id: userId,
          ip_address: ipAddress,
          device_fingerprint: fingerprint,
          user_agent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          screen_resolution: deviceInfo.screenResolution,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          timestamp: new Date(fullDeviceInfo.timestamp).toISOString()
        })
        .catch(err => console.error('Failed to log device info:', err));
    }

    return fullDeviceInfo;
  } catch (error) {
    console.error('Error logging exam attempt device info:', error);
    return null;
  }
}

/**
 * Check for suspicious device activity
 * Detects if multiple students might be using same device
 */
export async function checkSuspiciousDeviceActivity(
  examId: string,
  currentIp: string,
  supabaseClient?: any
): Promise<{
  isSuspicious: boolean;
  reason?: string;
  otherAttempts?: number;
}> {
  if (!supabaseClient || !currentIp) {
    return { isSuspicious: false };
  }

  try {
    // Query other attempts from same IP in last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: otherAttempts, error } = await supabaseClient
      .from('exam_attempt_logs')
      .select('user_id, created_at')
      .eq('exam_id', examId)
      .eq('ip_address', currentIp)
      .gt('created_at', twoHoursAgo);

    if (error) {
      console.error('Error checking device activity:', error);
      return { isSuspicious: false };
    }

    // If multiple users from same IP in short time, it's suspicious
    const uniqueUsers = new Set(otherAttempts?.map((a: any) => a.user_id) || []);
    
    if (uniqueUsers.size > 1) {
      return {
        isSuspicious: true,
        reason: `Multiple students detected on same IP (${uniqueUsers.size} users)`,
        otherAttempts: otherAttempts?.length || 0
      };
    }

    return { isSuspicious: false };
  } catch (error) {
    console.error('Error in device activity check:', error);
    return { isSuspicious: false };
  }
}

/**
 * Class for more advanced device tracking
 */
class DeviceTracker {
  private deviceInfo: DeviceInfo | null = null;
  private fingerprint: string | null = null;

  async initialize() {
    this.deviceInfo = getDeviceInfo();
    this.fingerprint = generateDeviceFingerprint();
    
    // Fetch IP address asynchronously
    if (!this.deviceInfo.ipAddress) {
      this.deviceInfo.ipAddress = await fetchStudentIPAddress();
    }
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  getFingerprint(): string | null {
    return this.fingerprint;
  }

  getIPAddress(): string | null {
    return this.deviceInfo?.ipAddress || null;
  }
}

export { DeviceTracker };
