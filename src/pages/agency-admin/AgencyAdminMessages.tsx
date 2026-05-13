import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Agency } from '@/types/agency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Reply, Trash2, Search, CheckCircle2, Inbox } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ContactMessage {
  id: string;
  agency_id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'replied';
  replied_at: string | null;
  created_at: string;
}

const AgencyAdminMessages = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    if (!agency?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: 'Failed to load messages', description: error.message, variant: 'destructive' });
      return;
    }
    setMessages((data ?? []) as ContactMessage[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [agency?.id]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject ?? '').toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [messages, search, filter]);

  const selected = messages.find((m) => m.id === selectedId) ?? filtered[0];

  const counts = useMemo(() => ({
    all: messages.length,
    new: messages.filter((m) => m.status === 'new').length,
    replied: messages.filter((m) => m.status === 'replied').length,
  }), [messages]);

  const markReplied = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'replied', replied_at: new Date().toISOString() } : m)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'destructive' });
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({ title: 'Message deleted' });
  };

  const replyHref = (m: ContactMessage) => {
    const subject = m.subject?.trim() ? `Re: ${m.subject}` : `Re: your message to ${agency?.name ?? 'us'}`;
    const body = `\n\n---\nOn ${new Date(m.created_at).toLocaleString()}, ${m.name} wrote:\n${m.message
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')}`;
    return `mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">Contact form submissions from your storefront.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'new', 'replied'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">
              {f} <span className="ml-2 text-xs opacity-70">{counts[f]}</span>
            </Button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="pl-9" />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filtered.map((m) => {
                const active = selected?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      active ? 'bg-accent border-accent-foreground/20' : 'bg-card hover:bg-accent/40 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      {m.status === 'new' && <Badge variant="default" className="shrink-0 text-[10px] h-5">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.subject || m.message}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <Card className="p-6 min-h-[400px]">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select a message to view details
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">{selected.subject || 'Contact form message'}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    From <span className="font-medium text-foreground">{selected.name}</span> ·{' '}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status === 'replied' ? (
                    <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Replied</Badge>
                  ) : (
                    <Badge>New</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm hover:underline">
                  <Mail className="h-4 w-4 text-muted-foreground" /> {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-sm hover:underline">
                    <Phone className="h-4 w-4 text-muted-foreground" /> {selected.phone}
                  </a>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Message</p>
                <div className="rounded-lg bg-muted/40 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button asChild onClick={() => selected.status === 'new' && markReplied(selected.id)}>
                  <a href={replyHref(selected)}><Reply className="h-4 w-4" /> Reply by email</a>
                </Button>
                {selected.status === 'new' && (
                  <Button variant="outline" onClick={() => markReplied(selected.id)}>
                    <CheckCircle2 className="h-4 w-4" /> Mark as replied
                  </Button>
                )}
                <Button variant="ghost" className="text-destructive hover:text-destructive ml-auto" onClick={() => remove(selected.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AgencyAdminMessages;