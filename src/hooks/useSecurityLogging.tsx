import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SecurityLogParams {
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const useSecurityLogging = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async ({
    action,
    resourceType,
    resourceId,
    details
  }: SecurityLogParams) => {
    try {
      // Only log if user is authenticated
      if (!user) return;

      // Get client information for security context
      const clientInfo = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...details
      };

      // Call the database function to log the action
      await supabase.rpc('log_user_action', {
        action_name: action,
        resource_type_param: resourceType || null,
        resource_id_param: resourceId || null,
        details_param: clientInfo
      });

    } catch (error) {
      // Silently fail to avoid disrupting user experience
      // In production, you might want to send this to a monitoring service
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  const logSearchQuery = useCallback((query: string) => {
    logSecurityEvent({
      action: 'search_query',
      resourceType: 'ai_search',
      details: { query, timestamp: Date.now() }
    });
  }, [logSecurityEvent]);

  const logAuthAttempt = useCallback((success: boolean, method: string = 'email') => {
    logSecurityEvent({
      action: success ? 'auth_success' : 'auth_failure',
      resourceType: 'authentication',
      details: { method, success, timestamp: Date.now() }
    });
  }, [logSecurityEvent]);

  const logProfileUpdate = useCallback(() => {
    logSecurityEvent({
      action: 'profile_update',
      resourceType: 'user_profile',
      details: { timestamp: Date.now() }
    });
  }, [logSecurityEvent]);

  const logFileUpload = useCallback((fileName: string, fileSize: number) => {
    logSecurityEvent({
      action: 'file_upload',
      resourceType: 'verification_document',
      details: { 
        fileName: fileName.replace(/[^a-zA-Z0-9._-]/g, ''), // Sanitize filename for logging
        fileSize, 
        timestamp: Date.now() 
      }
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback((activityType: string, details: Record<string, any>) => {
    logSecurityEvent({
      action: 'suspicious_activity',
      resourceType: 'security',
      details: { activityType, ...details, timestamp: Date.now() }
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logSearchQuery,
    logAuthAttempt,
    logProfileUpdate,
    logFileUpload,
    logSuspiciousActivity
  };
};