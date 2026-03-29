import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { useDeleteUser } from '@/hooks/use-user-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import { useAuth } from '@/contexts/AuthContext';

const roleConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck, color: 'text-accent' },
  agency_admin: { label: 'Agency Admin', icon: Shield, color: 'text-primary' },
};

const Users = () => {
  const { data: users = [], isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const { user: currentUser } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; role: string | null } | null>(null);

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage platform users and their roles</p>
        </div>
        <CreateUserDialog />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="card-premium rounded-xl overflow-hidden">
        <div className="px-7 py-6">
          <h2 className="text-lg font-display font-bold text-foreground">All Users</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5 font-light">Users with assigned roles on the platform</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border/70">
                <th className="px-7 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">User ID</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Role</th>
                <th className="px-6 py-3.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-7 py-4" colSpan={3}><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr className="border-t border-border/40">
                  <td colSpan={3} className="px-7 py-12 text-center text-sm text-muted-foreground">
                    <UsersIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
                    No users found with assigned roles.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const config = roleConfig[user.role ?? ''] ?? { label: user.role ?? 'Unknown', icon: Shield, color: 'text-muted-foreground' };
                  const RoleIcon = config.icon;
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <motion.tr key={user.id + (user.role ?? '')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-t border-border/40 hover:bg-accent/3 transition-colors">
                      <td className="px-7 py-4">
                        <p className="text-[13px] font-mono text-foreground">{user.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <RoleIcon className={`h-4 w-4 ${config.color}`} />
                          <span className={`text-[13px] font-semibold ${config.color}`}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: user.id, role: user.role })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the user's role and agency membership. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteUser.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
