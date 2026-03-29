import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, X, ShieldCheck, LayoutGrid 
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const defaultProducts = [
  { id: 'p1', name: 'Tata Solar Panel 400W Mono PERC', category: 'Panels', price: 18000, stock: 150, efficiency: 21.4, warranty: '25 Years' },
  { id: 'p2', name: 'Sungrow 5kW Grid-Tie Inverter', category: 'Inverters', price: 42000, stock: 40, efficiency: 98.4, warranty: '10 Years' },
  { id: 'p3', name: 'Mounting Structure Kit (10 Panels)', category: 'BOS', price: 8500, stock: 60, efficiency: null, warranty: '5 Years' },
  { id: 'p4', name: 'AC/DC Wiring & Protection Bundle', category: 'BOS', price: 4500, stock: 200, efficiency: null, warranty: '2 Years' },
];

const toastOk = (msg: string) => toast.success(msg, { style: { background: '#111827', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.3)' } });

export default function SellerCatalogue() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem('seller_products');
    setProducts(saved ? JSON.parse(saved) : defaultProducts);
  }, []);

  const save = (updated: any[]) => {
    setProducts(updated);
    localStorage.setItem('seller_products', JSON.stringify(updated));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      save(products.map(p => p.id === editing.id ? { ...p, ...form } : p));
      toastOk('Product updated.');
    } else {
      save([...products, { ...form, id: `p${Date.now()}` }]);
      toastOk('Product added.');
    }
    setShowModal(false);
  };

  const deleteP = (id: string) => {
    save(products.filter(p => p.id !== id));
    toastOk('Product removed.');
  };

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gradient-secondary flex items-center gap-3">
            <LayoutGrid className="text-secondary" /> Product Catalogue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-70">Hardware & Inventory Management</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ category: 'Panels' }); setShowModal(true); }} className="px-5 py-2.5 bg-primary text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Hardware
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {products.map((p, i) => (
          <GlassCard key={p.id} delay={i * 0.05}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20 mb-2 inline-block">{p.category}</span>
                <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(p); setForm(p); setShowModal(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => deleteP(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center mt-6">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-lg font-mono font-bold text-primary">₹{p.price.toLocaleString('en-IN')}</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Price</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className={cn('text-lg font-mono font-bold', p.stock < 10 ? 'text-red-400' : 'text-solar-green')}>{p.stock}</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Stock</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-lg font-mono font-bold">{p.efficiency ?? '--'}%</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Efficiency</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-[#0A0F1E] border border-primary/20 rounded-2xl p-8 max-w-md w-full z-10">
              <h3 className="text-xl font-bold mb-6">{editing ? 'Edit Item' : 'New Hardware'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <input required placeholder="Product Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required placeholder="Price" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none" />
                  <input type="number" required placeholder="Stock" value={form.stock || ''} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors">Save To Catalogue</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
