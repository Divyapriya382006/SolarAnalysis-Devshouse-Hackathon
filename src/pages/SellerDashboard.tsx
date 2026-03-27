import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package, Truck, CheckCircle, Star, Users, DollarSign, Activity,
  AlertCircle, Plus, Pencil, Trash2, X, Wrench, RefreshCcw,
  ShieldCheck, BadgeCheck, ChevronDown, LayoutGrid, ShoppingBag, UserCog,
  MapPin, Clock, ExternalLink, Send
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

// ─── SEED PRODUCTS ────────────────────────────────────────────────────────
const defaultProducts = [
  { id: 'p1', name: 'Tata Solar Panel 400W Mono PERC', category: 'Panels', price: 18000, stock: 150, efficiency: 21.4, warranty: '25 Years' },
  { id: 'p2', name: 'Sungrow 5kW Grid-Tie Inverter', category: 'Inverters', price: 42000, stock: 40, efficiency: 98.4, warranty: '10 Years' },
  { id: 'p3', name: 'Mounting Structure Kit (10 Panels)', category: 'BOS', price: 8500, stock: 60, efficiency: null, warranty: '5 Years' },
  { id: 'p4', name: 'AC/DC Wiring & Protection Bundle', category: 'BOS', price: 4500, stock: 200, efficiency: null, warranty: '2 Years' },
];

const INSTALLATION_STAFF = [
  { id: 'i1', name: 'Rajesh Kumar', role: 'Lead Electrician', available: true, completedJobs: 89 },
  { id: 'i2', name: 'Anbu Sundaram', role: 'Panel Fitter', available: false, completedJobs: 52 },
  { id: 'i3', name: 'Pradeep Singh', role: 'Civil & Structural', available: true, completedJobs: 37 },
];

// ─── TYPES ────────────────────────────────────────────────────────────────
type Tab = 'orders' | 'products' | 'customers' | 'transport' | 'reviews';

const CARRIERS = [
  { id: 'dtdc',      name: 'DTDC',           trackUrl: 'https://www.dtdc.in/tracking.asp' },
  { id: 'bluedart',  name: 'BlueDart',        trackUrl: 'https://www.bluedart.com/tracking' },
  { id: 'fedex',     name: 'FedEx',           trackUrl: 'https://www.fedex.com/en-in/tracking.html' },
  { id: 'delhivery', name: 'Delhivery',       trackUrl: 'https://www.delhivery.com/track/package' },
  { id: 'ekart',     name: 'Ekart (Flipkart)',trackUrl: 'https://ekartlogistics.com' },
];

interface Product {
  id: string; name: string; category: string; price: number; stock: number;
  efficiency: number | null; warranty: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────
const toastOk = (msg: string) => toast.success(msg, { style: { background: '#111827', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.3)' } });
const toastErr = (msg: string) => toast.error(msg, { style: { background: '#111827', color: '#F87171', border: '1px solid rgba(248,113,113,0.3)' } });
const statusColors: Record<string, string> = {
  Processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Shipped: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Delivered: 'text-green-400 bg-green-400/10 border-green-400/30',
  Returned: 'text-red-400 bg-red-400/10 border-red-400/30',
  Refunded: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStaff, setShowStaff] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<any>(null);
  const [refundNote, setRefundNote] = useState('');
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [transportForms, setTransportForms] = useState<Record<string, { carrier: string; trackingId: string; eta: string }>>({});

  // ── Load orders (ALL orders — seller sees everything in this mock setup) ──
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  // ── Load products from localStorage or seed defaults ──
  useEffect(() => {
    const saved = localStorage.getItem('seller_products');
    setProducts(saved ? JSON.parse(saved) : defaultProducts);
  }, []);

  const saveOrders = (updated: any[]) => {
    setOrders(updated);
    localStorage.setItem('sunwise_orders', JSON.stringify(updated));
  };

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('seller_products', JSON.stringify(updated));
  };

  // ── Order actions ──
  const updateStatus = (id: string, status: string) => {
    saveOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toastOk(`Order ${id} → ${status}`);
    // Notify customer when their order status changes
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

  // ── Product CRUD ──
  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({ category: 'Panels', efficiency: null });
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ ...p });
    setShowProductModal(true);
  };

  const deleteProduct = (id: string) => {
    saveProducts(products.filter(p => p.id !== id));
    toastOk('Product removed from catalogue.');
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      saveProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productForm } as Product : p));
      toastOk('Product updated.');
    } else {
      const newP: Product = { ...productForm, id: `p${Date.now()}` } as Product;
      saveProducts([...products, newP]);
      toastOk('Product added to catalogue.');
    }
    setShowProductModal(false);
  };

  // ── Transport ──
  const setTransportField = (orderId: string, field: string, value: string) => {
    setTransportForms(prev => ({
      ...prev,
      [orderId]: { carrier: '', trackingId: '', eta: '', ...prev[orderId], [field]: value }
    }));
  };

  const assignShipment = (order: any) => {
    const tf = transportForms[order.id];
    if (!tf?.trackingId || !tf?.carrier) { toastErr('Please select a carrier and enter a tracking ID.'); return; }
    const updated = orders.map(o => o.id === order.id ? { ...o, status: 'Shipped', shipment: tf } : o);
    saveOrders(updated);
    push({
      type: 'status',
      title: '🚚 Your Order is Shipped!',
      message: `Carrier: ${tf.carrier} | Tracking: ${tf.trackingId} | ETA: ${tf.eta || 'TBD'}. Track it in your Orders page.`,
      role: 'customer',
    });
    toastOk(`Shipment assigned for order ${order.id}`);
  };

  // ── KPIs ──
  const revenue = orders.reduce((a, o) => a + (o.status !== 'Refunded' ? o.totalCost : 0), 0);
  const avgRating = (() => {
    const rated = orders.filter(o => o.rated);
    return rated.length ? (rated.reduce((a, o) => a + o.rating, 0) / rated.length).toFixed(1) : '--';
  })();
  const activeInstalls = orders.filter(o => ['Processing', 'Shipped'].includes(o.status)).length;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'orders',    label: 'Customer Orders',   icon: ShoppingBag },
    { id: 'products',  label: 'Product Catalogue', icon: LayoutGrid },
    { id: 'customers', label: 'Customer Mgmt',     icon: UserCog },
    { id: 'transport', label: 'Transportation',    icon: Truck },
    { id: 'reviews',   label: 'Reviews',           icon: Star },
  ];

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-secondary mb-2">Seller Control Center</h1>
        <p className="text-muted-foreground">Logged in as <span className="text-secondary font-bold">{user?.name}</span></p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: DollarSign, color: 'text-secondary', label: 'Revenue', value: `₹${(revenue / 100000).toFixed(2)}L` },
          { icon: Users, color: 'text-primary', label: 'Total Orders', value: orders.length },
          { icon: Activity, color: 'text-solar-amber', label: 'Active Installs', value: activeInstalls },
          { icon: Star, color: 'text-yellow-400', label: 'Avg Rating', value: avgRating },
        ].map(({ icon: Icon, color, label, value }, i) => (
          <GlassCard key={i} delay={i * 0.05} className="p-5">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
            <div className="text-2xl font-mono font-bold">{value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn(
            'px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all',
            tab === id ? 'bg-secondary text-black shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
          )}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ─── TAB: ORDERS ────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="text-center py-16 glass rounded-2xl text-muted-foreground">No customer orders yet. Share your catalogue link!</div>
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
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-400 mb-3">
                    <strong>Return Reason:</strong> "{order.returnReason}"
                  </div>
                )}

                {/* Installation Staff Assignment */}
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
                                  <p className="text-sm font-bold">{s.name}</p>
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

                {order.status === 'Refunded' && (
                  <div className="text-xs font-bold text-violet-400 flex items-center gap-1"><BadgeCheck className="w-4 h-4" /> Refunded</div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* ─── TAB: PRODUCTS ───────────────────────────────────────────────── */}
      {tab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={openNewProduct} className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,160,0.2)] hover:scale-105 transition-transform flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p, i) => (
              <GlassCard key={p.id} delay={i * 0.05}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 mb-2 inline-block">{p.category}</span>
                    <h3 className="font-bold text-base leading-tight">{p.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditProduct(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mt-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-lg font-mono font-bold text-primary">₹{p.price.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Unit Price</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className={cn('text-lg font-mono font-bold', p.stock < 10 ? 'text-red-400' : 'text-solar-green')}>{p.stock}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">In Stock</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-lg font-mono font-bold">{p.efficiency ?? '--'}{p.efficiency ? '%' : ''}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Efficiency</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Warranty: {p.warranty}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: CUSTOMER MANAGEMENT ────────────────────────────────────── */}
      {tab === 'customers' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-2">Active Customer Accounts</h2>
          {orders.length === 0 && (
            <div className="text-center py-16 glass rounded-2xl text-muted-foreground">No customers yet.</div>
          )}
          {orders.map((order, i) => (
            <GlassCard key={order.id} delay={i * 0.05}>
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">{order.id}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold text-sm">R</div>
                    <div>
                      <div className="font-bold">Raj Kumar</div>
                      <div className="text-xs text-muted-foreground">raj@example.com</div>
                    </div>
                  </div>
                  <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div><span className="font-bold text-foreground">System:</span> {order.systemData?.totalKw}kW / {order.systemData?.panelCount} panels</div>
                    <div><span className="font-bold text-foreground">Installation:</span> {order.installationIncluded ? '✅ Yes' : '❌ No'}</div>
                    <div><span className="font-bold text-foreground">Order Date:</span> {new Date(order.date).toLocaleDateString()}</div>
                    <div><span className="font-bold text-foreground">Total Paid:</span> ₹{order.totalCost?.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <span className={cn('text-xs font-bold px-3 py-1 rounded border uppercase tracking-widest', statusColors[order.status] ?? '')}>{order.status}</span>

                  <div className="w-full space-y-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Delivery & Replacement</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(order.id, 'Shipped')}
                        disabled={order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Returned' || order.status === 'Refunded'}
                        className="flex-1 py-2 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
                      >
                        <Truck className="w-3 h-3" /> Ship Now
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Delivered')}
                        disabled={order.status === 'Delivered' || order.status === 'Returned' || order.status === 'Refunded'}
                        className="flex-1 py-2 text-xs font-bold rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Delivered
                      </button>
                    </div>

                    {order.status === 'Returned' && (
                      <button
                        onClick={() => updateStatus(order.id, 'Processing')}
                        className="w-full py-2 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Package className="w-3 h-3" /> Send Replacement Unit
                      </button>
                    )}

                    {(order.status === 'Returned' || order.status === 'Delivered') && order.status !== 'Refunded' && (
                      <button onClick={() => setShowRefundModal(order)}
                        className="w-full py-2 text-xs font-bold rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 flex items-center justify-center gap-1 transition-colors"
                      >
                        <RefreshCcw className="w-3 h-3" /> Process Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}


          {/* ── Installation Staff ── */}
          <h2 className="text-xl font-bold mt-8 mb-2">Installation Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INSTALLATION_STAFF.map((s, i) => (
              <GlassCard key={s.id} delay={i * 0.05}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-bold">{s.name[0]}</div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase', s.available ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-muted-foreground bg-white/5 border-white/10')}>
                    {s.available ? 'Available' : 'On Job'}
                  </span>
                </div>
                <div className="font-bold">{s.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{s.role}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-primary font-bold font-mono">{s.completedJobs}</span> installations completed
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: TRANSPORTATION ─────────────────────────────────────── */}
      {tab === 'transport' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Logistics & Shipment Management</h2>
              <p className="text-sm text-muted-foreground mt-1">Assign carriers, add tracking IDs, and set ETAs for every active order.</p>
            </div>
            <div className="text-xs text-muted-foreground bg-white/5 px-3 py-2 rounded-lg border border-white/10">
              {orders.filter(o => o.status === 'Shipped').length} / {orders.length} Shipped
            </div>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-16 glass rounded-2xl text-muted-foreground">No orders to manage yet.</div>
          )}

          {orders.map((order, i) => {
            const tf: { carrier: string; trackingId: string; eta: string } = transportForms[order.id] ?? { carrier: '', trackingId: '', eta: '' };
            const existingShipment = order.shipment;
            const carrier = CARRIERS.find(c => c.id === (existingShipment?.carrier || tf.carrier));
            return (
              <GlassCard key={order.id} delay={i * 0.04}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Order Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-mono bg-secondary/10 text-secondary px-2 py-1 rounded border border-secondary/20">{order.id}</span>
                      <span className={cn('text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest', statusColors[order.status] ?? '')}>{order.status}</span>
                      {existingShipment && (
                        <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded font-bold uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Carrier Assigned
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold">{order.systemData?.totalKw}kW System — {order.systemData?.panelCount} Panels</h3>
                    <p className="text-sm text-muted-foreground">Ordered {new Date(order.date).toLocaleDateString()}</p>

                    {/* Existing shipment info */}
                    {existingShipment && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Carrier</div>
                          <div className="font-bold text-sm">{existingShipment.carrier.toUpperCase()}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tracking ID</div>
                          <div className="font-mono font-bold text-sm text-primary">{existingShipment.trackingId}</div>
                        </div>
                        {existingShipment.eta && (
                          <div className="bg-white/5 rounded-xl p-3 col-span-2">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/>ETA</div>
                            <div className="font-bold text-sm">{existingShipment.eta}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Shipment Form */}
                  <div className="min-w-[260px] space-y-3">
                    {order.status === 'Delivered' || order.status === 'Refunded' ? (
                      <div className="text-sm text-muted-foreground text-center py-6 bg-white/5 rounded-xl">Order {order.status.toLowerCase()} — no action needed.</div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Carrier Partner</label>
                          <select
                            value={existingShipment?.carrier || tf.carrier || ''}
                            onChange={e => setTransportField(order.id, 'carrier', e.target.value)}
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-3 text-sm font-bold focus:border-secondary outline-none appearance-none"
                          >
                            <option value="">Select carrier…</option>
                            {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Tracking Number</label>
                          <input
                            type="text"
                            placeholder="e.g. BD123456789IN"
                            value={existingShipment?.trackingId || tf.trackingId || ''}
                            onChange={e => setTransportField(order.id, 'trackingId', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm font-mono text-primary placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Expected Delivery Date</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="date"
                              value={existingShipment?.eta || tf.eta || ''}
                              onChange={e => setTransportField(order.id, 'eta', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-secondary"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => assignShipment(order)}
                            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3 h-3" /> Dispatch & Notify
                          </button>
                          {carrier && (
                            <a
                              href={carrier.trackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                              title="Open carrier tracking portal"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}

          {/* Carrier Directory */}
          <h2 className="text-xl font-bold mt-8 mb-4">Carrier Directory</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CARRIERS.map((c, i) => (
              <a key={c.id} href={c.trackUrl} target="_blank" rel="noopener noreferrer"
                className="glass rounded-xl p-4 text-center hover:border-primary/50 hover:bg-white/5 transition-all group"
              >
                <Truck className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">{c.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
                  <ExternalLink className="w-2.5 h-2.5" /> Portal
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB: REVIEWS ──────────────────────────────────────────────── */}
      {tab === 'reviews' && (
        <div>
          {orders.filter(o => o.rated).length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl text-muted-foreground">No reviews received yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {orders.filter(o => o.rated).map((o, i) => (
                <GlassCard key={o.id} delay={i * 0.05}>
                  <div className="flex items-center gap-2 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className={cn('w-4 h-4', o.rating >= s ? 'text-yellow-400 fill-current' : 'text-white/20')} />)}
                    <span className="ml-auto text-xs text-muted-foreground font-mono">{o.id}</span>
                  </div>
                  <p className="text-sm italic">"{o.reviewText}"</p>
                  <div className="mt-3 text-xs text-muted-foreground">{new Date(o.date).toLocaleDateString()}</div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── REFUND MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRefundModal(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-[#0A0F1E] border border-violet-500/20 rounded-2xl p-8 max-w-md w-full z-10">
              <button onClick={() => setShowRefundModal(null)} className="absolute top-4 right-4 text-muted-foreground"><X className="w-5 h-5" /></button>
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4"><RefreshCcw className="w-6 h-6 text-violet-400" /></div>
              <h3 className="text-xl font-bold mb-1">Process Refund</h3>
              <p className="text-sm text-muted-foreground mb-1">Order: <span className="font-mono text-secondary">{showRefundModal?.id}</span></p>
              <p className="text-2xl font-mono font-bold text-violet-400 mb-6">₹{showRefundModal?.totalCost?.toLocaleString('en-IN')}</p>
              <form onSubmit={issueRefund} className="space-y-4">
                <textarea required value={refundNote} onChange={e => setRefundNote(e.target.value)} placeholder="Internal note (reason for refund)..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 h-24" />
                <button type="submit" className="w-full py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-colors">Confirm & Issue Refund</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── PRODUCT MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProductModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-[#0A0F1E] border border-primary/20 rounded-2xl p-8 max-w-md w-full z-10 overflow-y-auto max-h-screen">
              <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-muted-foreground"><X className="w-5 h-5" /></button>
              <h3 className="text-xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={saveProduct} className="space-y-4">
                {[
                  { label: 'Product Name', key: 'name', type: 'text', required: true },
                  { label: 'Price (₹)', key: 'price', type: 'number', required: true },
                  { label: 'Stock Quantity', key: 'stock', type: 'number', required: true },
                  { label: 'Efficiency (%)', key: 'efficiency', type: 'number', required: false },
                  { label: 'Warranty', key: 'warranty', type: 'text', required: true },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</label>
                    <input
                      type={field.type}
                      required={field.required}
                      value={(productForm as any)[field.key] ?? ''}
                      onChange={e => setProductForm(prev => ({ ...prev, [field.key]: field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
                  <select value={productForm.category ?? 'Panels'} onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary text-sm appearance-none">
                    {['Panels', 'Inverters', 'BOS', 'Batteries', 'Monitoring'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl mt-2">
                  {editingProduct ? 'Update Product' : 'Add to Catalogue'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
