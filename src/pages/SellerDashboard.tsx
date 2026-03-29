import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DollarSign, Users, Activity, Star, 
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  const revenue = orders.reduce((a, o) => a + (o.status !== 'Refunded' ? (o.totalCost || 0) : 0), 0);
  const avgRating = (() => {
    const rated = orders.filter(o => o.rated);
    return rated.length ? (rated.reduce((a, o) => a + o.rating, 0) / rated.length).toFixed(1) : '--';
  })();
  const activeInstalls = orders.filter(o => ['Processing', 'Shipped'].includes(o.status)).length;

  return (
    <div className="min-h-screen py-24 px-6 lg:px-16 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-gradient-secondary mb-3 tracking-tighter">Business Overview</h1>
        <p className="text-muted-foreground text-lg">Detailed performance metrics for <span className="text-secondary font-bold uppercase tracking-widest">{user?.name}</span></p>
      </motion.div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: DollarSign, color: 'text-secondary', label: 'Gross Revenue', value: `₹${(revenue / 100000).toFixed(2)}L` },
          { icon: Users, color: 'text-primary', label: 'Order Volume', value: orders.length },
          { icon: Activity, color: 'text-solar-green', label: 'Active Pipeline', value: activeInstalls },
          { icon: Star, color: 'text-yellow-400', label: 'Seller Rating', value: avgRating },
        ].map(({ icon: Icon, color, label, value }, i) => (
          <GlassCard key={i} delay={i * 0.05} className="group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icon size={80} />
            </div>
            <Icon className={`w-6 h-6 ${color} mb-4`} />
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-bold">{label}</div>
            <div className="text-3xl font-mono font-black">{value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY MOCK */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">Recent Business Activity</h2>
          <GlassCard className="space-y-6">
            {orders.slice(0, 8).map((o, i) => (
              <div key={i} className="flex gap-4 items-center border-l-2 border-secondary/20 pl-4 py-2 hover:bg-white/5 transition-colors rounded-r-xl">
                <div className="text-[10px] font-mono opacity-40 whitespace-nowrap">{new Date(o.date).toLocaleDateString()}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">New Order <span className="text-secondary">{o.id}</span></div>
                  <div className="text-[10px] text-muted-foreground">DC Capacity: {o.systemData?.totalKw}kW | Panels: {o.systemData?.panelCount}</div>
                </div>
                <div className="text-sm font-mono font-bold text-secondary">₹{o.totalCost?.toLocaleString('en-IN')}</div>
              </div>
            ))}
            {orders.length === 0 && <div className="text-sm text-muted-foreground italic">No recent transactions. Use the sidebar to manage your catalogue.</div>}
          </GlassCard>
        </div>

        {/* SYSTEM HEALTH / QUICK STATS */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6">Fulfillment Health</h2>
          <GlassCard>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground uppercase font-bold tracking-widest">Processing</span>
                <span className="font-mono font-bold text-yellow-400">{orders.filter(o => o.status === 'Processing').length}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${(orders.filter(o=>o.status==='Processing').length/(orders.length || 1))*100}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs mt-4">
                <span className="text-muted-foreground uppercase font-bold tracking-widest">Dispatched</span>
                <span className="font-mono font-bold text-blue-400">{orders.filter(o => o.status === 'Shipped').length}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: `${(orders.filter(o=>o.status==='Shipped').length/(orders.length || 1))*100}%` }} />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
