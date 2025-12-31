import { supabase } from "@/integrations/supabase/client";
import { generateDeviceFingerprint } from "./device-tracking";

export interface SecurityEvent {
  event_type: "tab-switch" | "fullscreen-exit" | "devtools" | "copy-paste" | "right-click";
  event_details?: Record<string, any>;
  severity?: "low" | "medium" | "high";
}

export interface QuestionOrder {
  original_order: string[];
  shuffled_order: string[];
  order_mapping: Record<number, number>;
}

/**
 * Tracks exam attempt start with IP and device information
 */
export async function trackExamAttemptStart(
  attemptId: string,
  examId: string,
  userId: string,
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    language: string;
  }
) {
  try {
    // Get IP address with multiple fallback providers
    const ipAddress = await fetchIPAddressWithFallback();

    // Log device information
    const { error } = await supabase.from("exam_attempt_logs").insert({
      exam_id: examId,
      user_id: userId,
      attempt_id: attemptId,
      ip_address: ipAddress,
      device_fingerprint: generateDeviceFingerprint(deviceInfo),
      user_agent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      screen_resolution: deviceInfo.screenResolution,
      timezone: deviceInfo.timezone,
      language: deviceInfo.language,
    });

    if (error) console.error("Error logging device info:", error);
  } catch (error) {
    console.error("Error in trackExamAttemptStart:", error);
  }
}

/**
 * Fetch IP address with multiple provider fallback
 */
async function fetchIPAddressWithFallback(): Promise<string> {
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
      const ip = data.ip || data.query;
      if (ip) return ip;
    } catch (error) {
      // Try next API
      continue;
    }
  }

  console.warn('Failed to fetch IP address from all services, using fallback');
  return "unknown";
}

/**
 * Store the randomized question order
 */
export async function storeQuestionOrder(
  attemptId: string,
  examId: string,
  userId: string,
  questionIds: string[],
  shuffledIds: string[],
  mapping: Record<number, number>
) {
  try {
    const { error } = await supabase.from("question_order").insert({
      exam_id: examId,
      user_id: userId,
      attempt_id: attemptId,
      original_order: questionIds,
      shuffled_order: shuffledIds,
      order_mapping: mapping,
    });

    if (error) console.error("Error storing question order:", error);
  } catch (error) {
    console.error("Error in storeQuestionOrder:", error);
  }
}

/**
 * Log a security event (tab switch, fullscreen exit, etc.)
 */
export async function logSecurityEvent(
  attemptId: string,
  examId: string,
  userId: string,
  event: SecurityEvent
) {
  try {
    const { error } = await supabase.from("security_events").insert({
      exam_id: examId,
      user_id: userId,
      attempt_id: attemptId,
      event_type: event.event_type,
      event_details: event.event_details || {},
      timestamp: Date.now(),
      severity: event.severity || "medium",
    });

    if (error) console.error("Error logging security event:", error);
  } catch (error) {
    console.error("Error in logSecurityEvent:", error);
  }
}

/**
 * Update exam attempt status when submitted
 */
export async function updateExamAttemptStatus(
  attemptId: string,
  data: {
    is_completed: boolean;
    score?: number;
    total_points?: number;
    passed?: boolean;
    end_time?: string;
    failure_reason?: "wrong_answers" | "rules_violation";
    is_terminated?: boolean;
    termination_reason?: string;
    violation_details?: Record<string, any>;
  }
) {
  try {
    const { error } = await supabase
      .from("exam_attempts")
      .update({
        is_completed: data.is_completed,
        score: data.score,
        total_points: data.total_points,
        passed: data.passed,
        end_time: data.end_time,
        failure_reason: data.failure_reason,
        is_terminated: data.is_terminated,
        termination_reason: data.termination_reason,
        violation_details: data.violation_details,
      })
      .eq("id", attemptId);

    if (error) console.error("Error updating exam attempt:", error);
  } catch (error) {
    console.error("Error in updateExamAttemptStatus:", error);
  }
}

/**
 * Get flagged attempts for teacher review
 */
export async function getFlaggedAttemptsForTeacher(examId: string) {
  try {
    const { data, error } = await supabase
      .from("exam_flagged_attempts")
      .select(`
        *,
        exam:exams(title)
      `)
      .eq("exam_id", examId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching flagged attempts:", error);
    return [];
  }
}

/**
 * Get security events for an attempt
 */
export async function getSecurityEventsForAttempt(attemptId: string) {
  try {
    const { data, error } = await supabase
      .from("security_events")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching security events:", error);
    return [];
  }
}

/**
 * Get attempt analytics for results page
 */
export async function getAttemptAnalytics(attemptId: string) {
  try {
    // Get security events
    const securityEvents = await getSecurityEventsForAttempt(attemptId);

    // Get question order
    const { data: questionOrder, error: qoError } = await supabase
      .from("question_order")
      .select("*")
      .eq("attempt_id", attemptId)
      .single();

    if (qoError && qoError.code !== "PGRST116") {
      console.error("Error fetching question order:", qoError);
    }

    // Get device logs
    const { data: deviceLogs, error: dlError } = await supabase
      .from("exam_attempt_logs")
      .select("*")
      .eq("attempt_id", attemptId)
      .single();

    if (dlError && dlError.code !== "PGRST116") {
      console.error("Error fetching device logs:", dlError);
    }

    return {
      securityEvents,
      questionOrder: questionOrder || null,
      deviceLogs: deviceLogs || null,
    };
  } catch (error) {
    console.error("Error in getAttemptAnalytics:", error);
    return { securityEvents: [], questionOrder: null, deviceLogs: null };
  }
}

/**
 * Check if attempt was terminated due to rule violations
 */
export function isAttemptTerminated(attempt: any): boolean {
  return attempt.is_terminated === true;
}

/**
 * Get termination reason for display
 */
export function getTerminationMessage(attempt: any): string {
  if (!attempt.is_terminated) return "";

  const reason = attempt.termination_reason || "Rule violations detected";
  const violations = attempt.violation_details?.rules_broken || [];

  return `${reason}. Violations: ${violations.join(", ")}. This exam will be reviewed by the teacher.`;
}

/**
 * Get failure reason for display
 */
export function getFailureReason(attempt: any): string {
  if (attempt.failure_reason === "rules_violation") {
    return "Failed due to rule violations";
  } else if (attempt.failure_reason === "wrong_answers") {
    return "Failed due to insufficient correct answers";
  }
  return "Failed";
}
