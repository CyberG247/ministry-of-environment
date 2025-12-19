import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  loading: boolean;
}

export const usePushNotifications = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
  });

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    
    if (!isSupported) {
      setState(prev => ({ ...prev, isSupported: false, loading: false }));
      return;
    }

    const permission = Notification.permission;
    
    // Register service worker
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      
      const subscription = await registration.pushManager.getSubscription();
      
      setState({
        isSupported: true,
        isSubscribed: !!subscription,
        permission,
        loading: false,
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setState(prev => ({ ...prev, isSupported: true, loading: false }));
    }
  };

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in your browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You will receive updates about your reports",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, [state.isSupported, toast]);

  const subscribe = useCallback(async () => {
    if (!state.isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // In production, you would use your VAPID public key here
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: VAPID_PUBLIC_KEY
      });

      setState(prev => ({ ...prev, isSubscribed: true }));
      
      toast({
        title: "Subscribed",
        description: "You will now receive push notifications",
      });

      return subscription;
    } catch (error) {
      console.error('Subscription failed:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not enable push notifications",
        variant: "destructive",
      });
      return null;
    }
  }, [state.isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setState(prev => ({ ...prev, isSubscribed: false }));
        
        toast({
          title: "Unsubscribed",
          description: "Push notifications disabled",
        });
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
    }
  }, [toast]);

  const sendTestNotification = useCallback(async () => {
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const registration = await navigator.serviceWorker.ready;
    
    registration.showNotification('ECSRS Test Notification', {
      body: 'This is a test notification from ECSRS',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: '/track' },
    });
  }, [state.permission, requestPermission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};
