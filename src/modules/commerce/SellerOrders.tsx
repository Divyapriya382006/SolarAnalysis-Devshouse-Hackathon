import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle, AlertCircle, Wrench, RefreshCcw, 
  ChevronDown, BadgeCheck, X
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

const INSTALLATION_STAFF = [
  { id: 'i1', name: 'Rajesh Kumar', role: 'Lead Electrician', available: true, completedJobs: 89 },
  { id: 'i2', name: 'Anbu Sundaram', role: 'Panel Fitter', available: false, completedJobs: 52 },
  { id: 'i3', name: 'Pradeep Singh', role: 'Civil & Structural', available: true, completedJobs: 37 },
];

const statusColors: Record<string, string> = {
  Processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Shipped: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
  Returned: 'text-red-400 bg-red-400/10 border-red-400/30',
  Refunded: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
};

const toastOk = (msg: string) => toast.success(msg, { style: { background: '#111827', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.3)' } });

export default function SellerOrders() {
  const { push } = useNotifications();
  const [orders, setOrders] = useState<any[]>([]);
  const [showStaff, setShowStaff] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<any>(null);
  const [refundNote, setRefundNote] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  const saveOrders = (updated: any[]) => {
    setOrders(updated);
    localStorage.setItem('sunwise_orders', JSON.stringify(updated));
  };

  const updateStatus = (id: string, status: string) => {
    saveOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toastOk(`Order ${id} → ${status}`);
    const msgs: Record<string, { title: string; message: string }> = {
      Shipped:   { title: '🚚 Your Order is Shipped!', message: 'Your solar hardware is on its way. Expect delivery in 3-5 days.' },
      Delivered: { title: '✅ Order Delivered!', message: 'Your solar system has been delivered and installed. Enjoy clean energy!' },
    };
    if (msgs[status]) push({ type: 'status', ...msgs[status], role: 'customer' });
  };

  const issueRefund = (e: React.FormEvent) => {
    e.preventDefault();
    saveOrders(orders.map(o => o.id === showRefundModal?.id ? { ...o, status: 'Refunded', refundNote } : o));
    toastOk('Refund issued successfully.');
    push({ type: 'refund', title: '💰 Refund Processed', message: 'Your refund has been approved and will be credited within 5-7 business days.', role: 'customer' });
    setShowRefundModal(null);
    setRefundNote('');
  };

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gradient-secondary flex items-center gap-3">
          <ShoppingBag className="text-secondary" /> Customer Orders
        </h1>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-70">Logistics & Fulfillment Hub</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="text-center py-16 glass rounded-2xl text-muted-foreground">No customer orders yet.</div>
        )}
        {orders.map((order, i) => (
          <GlassCard key={order.id} delay={i * 0.04} className="flex flex-col lg:flex-row gap-6 justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono bg-secondary/10 text-secondary px-2 py-1 rounded border border-secondary/20">{order.id}</span>
                <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest', statusColors[order.status] ?? 'text-muted-foreground')}>{order.status}</span>
                {order.installationIncluded && <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-1 rounded font-bold uppercase">Installation Required</span>}
                {order.returnReason && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-400/20 px-2 py-1 rounded font-bold uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Return Filed</span>}
              </div>

              <h3 className="font-bold text-lg mb-0.5">{order.systemData?.totalKw ?? '--'}kW System — {order.systemData?.panelCount ?? '--'} Panels</h3>
              <div className="text-sm text-muted-foreground mb-3">Ordered {new Date(order.date).toLocaleString()}</div>

              {order.returnReason && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-400 mb-3 italic">
                  " {order.returnReason} "
                </div>
              )}

              {order.installationIncluded && order.status !== 'Returned' && order.status !== 'Refunded' && (
                <div className="mt-3">
                  <button onClick={() => setShowStaff(showStaff === order.id ? null : order.id)}
                    className="text-xs flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Wrench className="w-3 h-3" /> Assign Installation Team <ChevronDown className={cn('w-3 h-3 transition-transform', showStaff === order.id ? 'rotate-180' : '')} />
                  </button>
                  <AnimatePresence>
                    {showStaff === order.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 space-y-2">
                          {INSTALLATION_STAFF.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                              <div>
                                <p className="text-[13px] font-bold">{s.name}</p>
                                <p className="text-[10px] text-muted-foreground">{s.role} • {s.completedJobs} jobs done</p>
                              </div>
                              <button
                                disabled={!s.available}
                                onClick={() => { toastOk(`${s.name} assigned to order ${order.id}`); setShowStaff(null); }}
                                className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors', s.available ? 'bg-primary text-black hover:bg-primary/80' : 'bg-white/5 text-muted-foreground cursor-not-allowed')}
                              >
                                {s.available ? 'Assign' : 'Unavailable'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[180px]">
              <div className="text-2xl font-mono font-bold text-secondary">₹{order.totalCost?.toLocaleString('en-IN')}</div>
              {order.status !== 'Returned' && order.status !== 'Refunded' && (
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/20 rounded-lg py-2 px-3 text-sm font-bold outline-none focus:border-secondary appearance-none"
                >
                  <option value="Processing">📦 Processing</option>
                  <option value="Shipped">🚚 Shipped</option>
                  <option value="Delivered">✅ Delivered / Installed</option>
                </select>
              )}
              {(order.status === 'Returned' || order.status === 'Delivered') && order.status !== 'Refunded' && (
                <button onClick={() => setShowRefundModal(order)} className="w-full py-2 text-xs font-bold rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 flex items-center justify-center gap-1">
                  <RefreshCcw className="w-3 h-3" /> Issue Refund
                </button>
              )}
              {order.status === 'Refunded' && <div className="text-xs font-bold text-violet-400 flex items-center gap-1"><BadgeCheck className="w-4 h-4" /> Refunded</div>}
            </div>
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRefundModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-[#0A0F1E] border border-violet-500/20 rounded-2xl p-8 max-w-md w-full z-10">
              <button onClick={() => setShowRefundModal(null)} className="absolute top-4 right-4 text-muted-foreground"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4"><RefreshCcw className="w-6 h-6 text-violet-400" /></div>
              <h3 className="text-xl font-bold mb-1">Process Refund</h3>
              <p className="text-2xl font-mono font-bold text-violet-400 mb-6">₹{showRefundModal?.totalCost?.toLocaleString('en-IN')}</p>
              <form onSubmit={issueRefund} className="space-y-4">
                <textarea required value={refundNote} onChange={e => setRefundNote(e.target.value)} placeholder="Reason for refund..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-violet-500 h-24" />
                <button type="submit" className="w-full py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-colors">Confirm & Issue Refund</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
