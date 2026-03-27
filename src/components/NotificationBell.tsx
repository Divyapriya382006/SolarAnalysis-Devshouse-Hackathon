import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Package, Wrench, RefreshCcw, Star, Zap, X } from 'lucide-react';
import { useNotifications, Notification, NotifType } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const typeConfig: Record<NotifType, { icon: any; color: string; bg: string }> = {
  order:       { icon: Package,    color: 'text-primary',      bg: 'bg-primary/10' },
  status:      { icon: Zap,        color: 'text-blue-400',     bg: 'bg-blue-400/10' },
  maintenance: { icon: Wrench,     color: 'text-amber-400',    bg: 'bg-amber-400/10' },
  review:      { icon: Star,       color: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
  refund:      { icon: RefreshCcw, color: 'text-violet-400',   bg: 'bg-violet-400/10' },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clear } = useNotifications();
  const { role } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  // Filter to show only relevant notifications for current role
  const myNotifs = notifications.filter(n => n.role === role);
  const myUnread = myNotifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) markAllRead();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        title="Notifications"
        className={cn('relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
          open ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
      >
        {myUnread > 0 ? <BellRing className="w-5 h-5 animate-[wiggle_0.5s_ease-in-out]" /> : <Bell className="w-5 h-5" />}
        {myUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {myUnread > 9 ? '9+' : myUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            className="absolute left-12 top-0 w-80 bg-[#0A0F1E] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-bold text-sm">Notifications</span>
              <div className="flex items-center gap-2">
                {myNotifs.length > 0 && (
                  <button onClick={clear} className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors">Clear all</button>
                )}
                <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {myNotifs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No notifications yet
                </div>
              ) : (
                myNotifs.map((n: Notification) => {
                  const cfg = typeConfig[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={n.id} className={cn('flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors', !n.read ? 'bg-white/[0.03]' : '')}>
                      <div className={cn('w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5', cfg.bg)}>
                        <Icon className={cn('w-4 h-4', cfg.color)} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold leading-tight flex items-center gap-1">
                          {n.title}
                          {!n.read && <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.timestamp)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
