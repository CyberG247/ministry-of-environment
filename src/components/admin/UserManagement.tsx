import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  UserPlus,
  Shield,
  MapPin,
  Loader2,
  Edit2,
  UserCheck,
  Users,
} from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  assigned_lga_id: string | null;
  assigned_lga_name: string | null;
  created_at: string;
}

interface LGA {
  id: string;
  name: string;
}

const roleColors: Record<string, string> = {
  citizen: "bg-gray-500",
  field_officer: "bg-blue-500",
  admin: "bg-purple-500",
  super_admin: "bg-red-500",
};

const roleLabels: Record<string, string> = {
  citizen: "Citizen",
  field_officer: "Field Officer",
  admin: "Admin",
  super_admin: "Super Admin",
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newLgaId, setNewLgaId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchLgas();
  }, []);

  const fetchLgas = async () => {
    const { data } = await supabase.from('lgas').select('id, name').order('name');
    if (data) setLgas(data);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch user_roles with profiles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          assigned_lga_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, phone');

      if (profilesError) throw profilesError;

      // Fetch LGAs for mapping
      const { data: lgaData } = await supabase.from('lgas').select('id, name');
      const lgaMap: Record<string, string> = {};
      lgaData?.forEach(l => { lgaMap[l.id] = l.name; });

      // Combine data
      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => { profileMap[p.user_id] = p; });

      const combined: UserWithRole[] = (roles || []).map(role => ({
        id: role.id,
        user_id: role.user_id,
        email: profileMap[role.user_id]?.email || 'N/A',
        full_name: profileMap[role.user_id]?.full_name || 'N/A',
        phone: profileMap[role.user_id]?.phone || null,
        role: role.role,
        assigned_lga_id: role.assigned_lga_id,
        assigned_lga_name: role.assigned_lga_id ? lgaMap[role.assigned_lga_id] : null,
        created_at: role.created_at,
      }));

      setUsers(combined);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewLgaId(user.assigned_lga_id);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setUpdating(true);
    try {
      const updateData: any = {
        role: newRole as "citizen" | "field_officer" | "admin" | "super_admin",
      };

      // Only set LGA for field officers
      if (newRole === 'field_officer') {
        updateData.assigned_lga_id = newLgaId;
      } else {
        updateData.assigned_lga_id = null;
      }

      const { error } = await supabase
        .from('user_roles')
        .update(updateData)
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: `${editingUser.full_name}'s role has been updated`,
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    citizens: users.filter(u => u.role === 'citizen').length,
    fieldOfficers: users.filter(u => u.role === 'field_officer').length,
    admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-gray-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.citizens}</p>
            <p className="text-sm text-muted-foreground">Citizens</p>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.fieldOfficers}</p>
            <p className="text-sm text-muted-foreground">Field Officers</p>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.admins}</p>
            <p className="text-sm text-muted-foreground">Administrators</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="citizen">Citizens</SelectItem>
            <SelectItem value="field_officer">Field Officers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned LGA</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${roleColors[user.role]} text-white`}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.assigned_lga_name ? (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {user.assigned_lga_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Update the role and LGA assignment for {editingUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Citizen</SelectItem>
                  <SelectItem value="field_officer">Field Officer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRole === 'field_officer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned LGA</label>
                <Select value={newLgaId || ''} onValueChange={setNewLgaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {lgas.map((lga) => (
                      <SelectItem key={lga.id} value={lga.id}>
                        {lga.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Field officers will only see reports from their assigned LGA
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={updating}>
              {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
