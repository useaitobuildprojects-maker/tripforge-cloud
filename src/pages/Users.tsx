import { motion } from 'framer-motion';
import { Users as UsersIcon, Shield, ShieldCheck } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';

const roleConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck, color: 'text-accent' },
  agency_admin: { label: 'Agency Admin', icon: Shield, color: 'text-primary' },
};

const Users = () => {
  const { data: users = [], isLoading } = useUsers();

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage platform users and their roles</p>
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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-7 py-4" colSpan={2}><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr className="border-t border-border/40">
                  <td colSpan={2} className="px-7 py-12 text-center text-sm text-muted-foreground">
                    <UsersIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
                    No users found with assigned roles.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const config = roleConfig[user.role ?? ''] ?? { label: user.role ?? 'Unknown', icon: Shield, color: 'text-muted-foreground' };
                  const RoleIcon = config.icon;
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
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Users;
