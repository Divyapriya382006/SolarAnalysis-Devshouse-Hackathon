import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const CARRIERS = [
  { id: 'dtdc',      name: 'DTDC',           trackUrl: 'https://www.dtdc.in/tracking.asp' },
  { id: 'bluedart',  name: 'BlueDart',        trackUrl: 'https://www.bluedart.com/tracking' },
  { id: 'fedex',     name: 'FedEx',           trackUrl: 'https://www.fedex.com/en-in/tracking.html' },
  { id: 'delhivery', name: 'Delhivery',       trackUrl: 'https://www.delhivery.com/track/package' },
];

export default function Transportation() {
  const [orders, setOrders] = useState<any[]>([]);
  const [forms, setForms] = useState<Record<string, any>>({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  const assignShipment = (orderId: string) => {
    const tf = forms[orderId];
    if (!tf?.carrier || !tf?.trackingId) { toast.error('Carrier & Tracking ID required!'); return; }
    const updated = orders.map(o => o.id === orderId ? { ...o, status: 'Shipped', shipment: tf } : o);
    localStorage.setItem('sunwise_orders', JSON.stringify(updated));
    setOrders(updated);
    toast.success('Logistics updated & customer notified!');
  };

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gradient-secondary flex items-center gap-3">
          <Truck className="text-secondary" /> Logistics & Transport
        </h1>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-70">Carrier Assignment & Global Tracking</p>
      </div>

      <div className="space-y-6">
        {orders.map((o, i) => (
          <GlassCard key={o.id} delay={i * 0.05} className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="text-xs font-mono text-secondary mb-2">{o.id}</div>
              <h3 className="font-bold text-lg">{o.systemData?.totalKw}kW System</h3>
              <p className="text-sm text-muted-foreground">Destination: {o.address || 'Verified Installation Site'}</p>
              
              {o.shipment && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Carrier</div>
                    <div className="font-bold text-primary">{o.shipment.carrier.toUpperCase()}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Tracking</div>
                    <div className="font-mono font-bold">{o.shipment.trackingId}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-80 space-y-4">
              {o.status === 'Delivered' ? (
                <div className="h-full flex items-center justify-center glass rounded-xl text-green-400 font-bold text-xs uppercase tracking-widest">✅ Delivered</div>
              ) : (
                <>
                  <select 
                    value={forms[o.id]?.carrier || ''} 
                    onChange={e => setForms({ ...forms, [o.id]: { ...forms[o.id], carrier: e.target.value }})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-secondary outline-none"
                  >
                    <option value="">Select Carrier...</option>
                    {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input 
                    placeholder="Tracking ID" 
                    value={forms[o.id]?.trackingId || ''} 
                    onChange={e => setForms({ ...forms, [o.id]: { ...forms[o.id], trackingId: e.target.value }})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none"
                  />
                  <button onClick={() => assignShipment(o.id)} className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-xs">
                    <Send className="w-4 h-4" /> Dispatch Shipment
                  </button>
                </>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
