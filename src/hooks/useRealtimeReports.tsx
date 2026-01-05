import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportChange {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  old_status?: string;
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const useRealtimeReports = (userId?: string, onUpdate?: () => void) => {
  const { toast } = useToast();

  const showNotification = useCallback((report: ReportChange, eventType: string) => {
    if (eventType === 'UPDATE') {
      toast({
        title: "Report Status Updated",
        description: `Report ${report.tracking_id}: "${report.title}" is now ${statusLabels[report.status] || report.status}`,
      });

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('ECSRS Report Update', {
          body: `Report ${report.tracking_id} status changed to ${statusLabels[report.status] || report.status}`,
          icon: '/favicon.ico',
        });
      }
    }

    onUpdate?.();
  }, [toast, onUpdate]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('user-reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: `reporter_id=eq.${userId}`,
        },
        (payload) => {
          const newRecord = payload.new as ReportChange;
          const oldRecord = payload.old as ReportChange;
          
          if (payload.eventType === 'UPDATE' && oldRecord?.status !== newRecord?.status) {
            showNotification(newRecord, 'UPDATE');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showNotification]);
};

export const useRealtimeAdminReports = (onUpdate?: () => void) => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('admin-reports-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reports',
        },
        (payload) => {
          const newReport = payload.new as ReportChange;
          toast({
            title: "New Report Submitted",
            description: `New report ${newReport.tracking_id}: "${newReport.title}"`,
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New ECSRS Report', {
              body: `New report submitted: ${newReport.title}`,
              icon: '/favicon.ico',
            });
          }

          onUpdate?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reports',
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, onUpdate]);
};
