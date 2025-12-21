import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  email_on_status_change: boolean;
  email_on_assignment: boolean;
  email_on_resolution: boolean;
  sms_on_status_change: boolean;
  sms_on_resolution: boolean;
  push_on_status_change: boolean;
  push_on_assignment: boolean;
  push_on_resolution: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_enabled: true,
  sms_enabled: false,
  push_enabled: true,
  email_on_status_change: true,
  email_on_assignment: true,
  email_on_resolution: true,
  sms_on_status_change: false,
  sms_on_resolution: true,
  push_on_status_change: true,
  push_on_assignment: true,
  push_on_resolution: true,
};

const NotificationPreferences = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          push_enabled: data.push_enabled,
          email_on_status_change: data.email_on_status_change,
          email_on_assignment: data.email_on_assignment,
          email_on_resolution: data.email_on_resolution,
          sms_on_status_change: data.sms_on_status_change,
          sms_on_resolution: data.sms_on_resolution,
          push_on_status_change: data.push_on_status_change,
          push_on_assignment: data.push_on_assignment,
          push_on_resolution: data.push_on_resolution,
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user?.id,
          ...preferences,
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Notification Preferences</h1>
            <p className="text-muted-foreground mt-2">
              Manage how you receive updates about your reports
            </p>
          </div>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Receive updates via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_enabled" className="flex-1">
                  Enable email notifications
                </Label>
                <Switch
                  id="email_enabled"
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => updatePreference("email_enabled", checked)}
                />
              </div>
              {preferences.email_enabled && (
                <>
                  <Separator />
                  <div className="space-y-3 pl-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_on_status_change" className="text-sm text-muted-foreground">
                        Status changes
                      </Label>
                      <Switch
                        id="email_on_status_change"
                        checked={preferences.email_on_status_change}
                        onCheckedChange={(checked) => updatePreference("email_on_status_change", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_on_assignment" className="text-sm text-muted-foreground">
                        Report assigned to officer
                      </Label>
                      <Switch
                        id="email_on_assignment"
                        checked={preferences.email_on_assignment}
                        onCheckedChange={(checked) => updatePreference("email_on_assignment", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_on_resolution" className="text-sm text-muted-foreground">
                        Report resolved
                      </Label>
                      <Switch
                        id="email_on_resolution"
                        checked={preferences.email_on_resolution}
                        onCheckedChange={(checked) => updatePreference("email_on_resolution", checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Receive updates via text message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_enabled" className="flex-1">
                  Enable SMS notifications
                </Label>
                <Switch
                  id="sms_enabled"
                  checked={preferences.sms_enabled}
                  onCheckedChange={(checked) => updatePreference("sms_enabled", checked)}
                />
              </div>
              {preferences.sms_enabled && (
                <>
                  <Separator />
                  <div className="space-y-3 pl-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms_on_status_change" className="text-sm text-muted-foreground">
                        Status changes
                      </Label>
                      <Switch
                        id="sms_on_status_change"
                        checked={preferences.sms_on_status_change}
                        onCheckedChange={(checked) => updatePreference("sms_on_status_change", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms_on_resolution" className="text-sm text-muted-foreground">
                        Report resolved
                      </Label>
                      <Switch
                        id="sms_on_resolution"
                        checked={preferences.sms_on_resolution}
                        onCheckedChange={(checked) => updatePreference("sms_on_resolution", checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Receive instant browser notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push_enabled" className="flex-1">
                  Enable push notifications
                </Label>
                <Switch
                  id="push_enabled"
                  checked={preferences.push_enabled}
                  onCheckedChange={(checked) => updatePreference("push_enabled", checked)}
                />
              </div>
              {preferences.push_enabled && (
                <>
                  <Separator />
                  <div className="space-y-3 pl-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push_on_status_change" className="text-sm text-muted-foreground">
                        Status changes
                      </Label>
                      <Switch
                        id="push_on_status_change"
                        checked={preferences.push_on_status_change}
                        onCheckedChange={(checked) => updatePreference("push_on_status_change", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push_on_assignment" className="text-sm text-muted-foreground">
                        Report assigned to officer
                      </Label>
                      <Switch
                        id="push_on_assignment"
                        checked={preferences.push_on_assignment}
                        onCheckedChange={(checked) => updatePreference("push_on_assignment", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push_on_resolution" className="text-sm text-muted-foreground">
                        Report resolved
                      </Label>
                      <Switch
                        id="push_on_resolution"
                        checked={preferences.push_on_resolution}
                        onCheckedChange={(checked) => updatePreference("push_on_resolution", checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={savePreferences} className="w-full" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
