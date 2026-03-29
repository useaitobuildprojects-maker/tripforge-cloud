import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check user role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleData?.role === 'agency_admin') {
        // Find the agency this user belongs to
        const { data: memberData } = await supabase
          .from('agency_members')
          .select('agency_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberData?.agency_id) {
          const { data: agencyData } = await supabase
            .from('agencies')
            .select('slug')
            .eq('id', memberData.agency_id)
            .maybeSingle();

          if (agencyData?.slug) {
            navigate(`/agency/${agencyData.slug}/admin`);
            return;
          }
        }
      }
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent gold-glow mb-5">
            <Car className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="text-[28px] font-display font-bold text-foreground">TravelHub</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">
            Admin Panel
          </p>
        </div>

        {/* Form */}
        <div className="card-premium rounded-2xl p-8">
          <div className="mb-7">
            <h2 className="text-lg font-display font-bold text-foreground">Welcome back</h2>
            <p className="text-[13px] text-muted-foreground mt-1 font-light">
              Sign in to your admin account
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/15 mb-6"
            >
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-[13px] text-destructive">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2 block">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full h-12 rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2 block">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 rounded-xl border border-border bg-background pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-accent text-accent-foreground font-semibold rounded-xl shadow-md hover:shadow-lg hover:opacity-95 transition-all text-[14px]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6 font-light">
          Protected area · Authorized access only
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
