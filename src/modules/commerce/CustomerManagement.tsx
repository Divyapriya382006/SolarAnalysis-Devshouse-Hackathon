import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Truck, Package, RefreshCcw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const INSTALLATION_STAFF = [
  { id: 'i1', name: 'Rajesh Kumar', available: true, completedJobs: 89, role: 'Lead Electrician' },
  { id: 'i2', name: 'Anbu Sundaram', available: false, completedJobs: 52, role: 'Panel Fitter' },
  { id: 'i3', name: 'Pradeep Singh', available: true, completedJobs: 37, role: 'Civil & Structural' },
];

export default function CustomerManagement() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gradient-secondary flex items-center gap-3">
          <Users className="text-secondary" /> Customer Management
        </h1>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-70">Client Lifecycle & Staffing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Active Clients</h2>
          {orders.map((o, i) => (
            <GlassCard key={o.id} delay={i * 0.05} className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                {o.id.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-bold">Client {o.id}</div>
                <div className="text-xs text-muted-foreground">DC Capacity: {o.systemData?.totalKw}kW</div>
                <div className="mt-3 flex gap-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest">{o.status}</span>
                </div>
              </div>
            </GlassCard>
          ))}
          {orders.length === 0 && <div className="text-muted-foreground p-8 glass rounded-2xl text-center">No active client data.</div>}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Installation Teams</h2>
          <div className="grid grid-cols-1 gap-4">
            {INSTALLATION_STAFF.map((s, i) => (
              <GlassCard key={s.id} delay={i * 0.1}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[10px] uppercase font-bold text-primary tracking-widest">{s.role}</div>
                  </div>
                  <div className={cn('text-[9px] font-bold px-3 py-1 rounded-full uppercase', s.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                    {s.available ? 'Standby' : 'On Site'}
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Completed {s.completedJobs} installations</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
