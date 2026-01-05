import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Loader2 } from 'lucide-react';

interface FieldOfficer {
  user_id: string;
  role: string;
  assigned_lga_id: string | null;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
  lga: {
    name: string;
  } | null;
}

interface ReportAssignmentProps {
  reportId: string;
  reportTrackingId: string;
  currentOfficerId: string | null;
  reportLgaId: string | null;
  onAssigned: () => void;
}

const ReportAssignment = ({
  reportId,
  reportTrackingId,
  currentOfficerId,
  reportLgaId,
  onAssigned,
}: ReportAssignmentProps) => {
  const [open, setOpen] = useState(false);
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>(currentOfficerId || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchFieldOfficers();
    }
  }, [open]);

  const fetchFieldOfficers = async () => {
    setFetching(true);
    try {
      // First, get user_roles for field officers
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, assigned_lga_id')
        .eq('role', 'field_officer');

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setOfficers([]);
        return;
      }

      // Get profiles for these users
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get LGAs
      const lgaIds = rolesData.map(r => r.assigned_lga_id).filter(Boolean) as string[];
      let lgasData: { id: string; name: string }[] = [];
      if (lgaIds.length > 0) {
        const { data: lgas } = await supabase
          .from('lgas')
          .select('id, name')
          .in('id', lgaIds);
        lgasData = lgas || [];
      }

      // Map the data together
      const mappedOfficers: FieldOfficer[] = rolesData.map(role => {
        const profile = profilesData?.find(p => p.user_id === role.user_id);
        const lga = lgasData.find(l => l.id === role.assigned_lga_id);
        
        return {
          user_id: role.user_id,
          role: role.role,
          assigned_lga_id: role.assigned_lga_id,
          profile: profile ? { full_name: profile.full_name, email: profile.email } : null,
          lga: lga ? { name: lga.name } : null,
        };
      });

      // Sort: prioritize officers assigned to the same LGA as the report
      const sorted = mappedOfficers.sort((a, b) => {
        if (reportLgaId) {
          if (a.assigned_lga_id === reportLgaId && b.assigned_lga_id !== reportLgaId) return -1;
          if (b.assigned_lga_id === reportLgaId && a.assigned_lga_id !== reportLgaId) return 1;
        }
        return 0;
      });

      setOfficers(sorted);
    } catch (error) {
      console.error('Error fetching field officers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load field officers',
        variant: 'destructive',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) {
      toast({
        title: 'Select an Officer',
        description: 'Please select a field officer to assign',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update the report with assigned officer
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          assigned_officer_id: selectedOfficer,
          assigned_at: new Date().toISOString(),
          status: 'assigned',
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Create a report update record
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('report_updates').insert([{
        report_id: reportId,
        updated_by: user?.id,
        previous_status: 'submitted',
        new_status: 'assigned',
        notes: notes || `Assigned to field officer`,
      }]);

      // Send notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            type: 'assignment',
            report_id: reportId,
            officer_id: selectedOfficer,
          },
        });
      } catch (notifError) {
        console.log('Notification not sent:', notifError);
      }

      toast({
        title: 'Report Assigned',
        description: `Report ${reportTrackingId} has been assigned successfully`,
      });

      setOpen(false);
      onAssigned();
    } catch (error: any) {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          assigned_officer_id: null,
          assigned_at: null,
          status: 'submitted',
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Assignment Removed',
        description: `Report ${reportTrackingId} is now unassigned`,
      });

      setOpen(false);
      setSelectedOfficer('');
      onAssigned();
    } catch (error: any) {
      toast({
        title: 'Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCheck className="w-4 h-4" />
          {currentOfficerId ? 'Reassign' : 'Assign'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Field Officer</DialogTitle>
          <DialogDescription>
            Assign report <span className="font-mono text-primary">{reportTrackingId}</span> to a field officer for investigation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {fetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : officers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No field officers available.</p>
              <p className="text-sm mt-1">Please add field officers in User Management first.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Select Field Officer</Label>
                <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an officer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer.user_id} value={officer.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{officer.profile?.full_name || officer.profile?.email || 'Unknown'}</span>
                          {officer.lga && (
                            <Badge variant="secondary" className="text-xs">
                              {officer.lga.name}
                            </Badge>
                          )}
                          {officer.assigned_lga_id === reportLgaId && reportLgaId && (
                            <Badge className="bg-green-500 text-white text-xs">Same LGA</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assignment Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions for the field officer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                {currentOfficerId && (
                  <Button
                    variant="outline"
                    onClick={handleUnassign}
                    disabled={loading}
                    className="flex-1"
                  >
                    Unassign
                  </Button>
                )}
                <Button
                  onClick={handleAssign}
                  disabled={loading || !selectedOfficer}
                  className="flex-1"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {currentOfficerId ? 'Reassign' : 'Assign'} Officer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportAssignment;
