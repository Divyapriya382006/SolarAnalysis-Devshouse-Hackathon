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
    <div className="relative">
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
          <>
            {/* Invisible backdrop to close on outside click */}
            <div
              className="fixed inset-0 z-[90]"
              onClick={() => setOpen(false)}
            />
            {/* Panel — slides in from left, positioned right of the sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed top-0 left-16 h-screen w-[360px] z-[100] bg-[#080d1a] border-r border-white/8 shadow-[4px_0_40px_rgba(0,0,0,0.6)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Notifications
                  </h3>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Real-time alerts</p>
                </div>
                <div className="flex items-center gap-3">
                  {myNotifs.length > 0 && (
                    <button
                      onClick={clear}
                      className="text-[10px] font-bold text-muted-foreground hover:text-red-400 transition-colors uppercase tracking-tighter"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 px-2 py-2">
                {myNotifs.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/5">
                      <Bell className="w-7 h-7 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">We'll alert you when something happens.</p>
                  </div>
                ) : (
                  myNotifs.map((n: Notification) => {
                    const cfg = typeConfig[n.type];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          'flex gap-3 px-3 py-4 hover:bg-white/[0.03] transition-all relative rounded-xl mx-1 my-1',
                          !n.read ? 'bg-primary/[0.03] border-l-2 border-primary' : ''
                        )}
                      >
                        <div className={cn('w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center', cfg.bg)}>
                          <Icon className={cn('w-4 h-4', cfg.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-white truncate">{n.title}</span>
                            <span className="text-[9px] font-mono text-muted-foreground/50 ml-2 shrink-0">{timeAgo(n.timestamp)}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                        </div>
                        {!n.read && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_6px_rgba(0,229,160,0.5)]" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium opacity-40 text-center">Solar Bharat AI · Alert Engine</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
