import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, AlertTriangle, Star, X, MessageSquare, RefreshCcw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';
import { useNotifications } from '@/contexts/NotificationContext';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'return' | 'review' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const { push } = useNotifications();

  useEffect(() => {
    const data = localStorage.getItem('sunwise_orders');
    if (data) {
      const parsed = JSON.parse(data);
      setOrders(parsed);
      // Push a maintenance reminder if any delivered order hasn't been reminded yet
      const alreadyReminded = localStorage.getItem('maintenance_reminded');
      const hasDelivered = parsed.some((o: any) => o.status === 'Delivered');
      if (hasDelivered && !alreadyReminded) {
        push({
          type: 'maintenance',
          title: '🔧 Maintenance Tip',
          message: 'Clean your solar panels every 6 months for optimal efficiency. Set your next reminder now!',
          role: 'customer',
        });
        localStorage.setItem('maintenance_reminded', '1');
      }
    }
  }, []);

  const openModal = (type: 'return' | 'review', order: any) => {
    setSelectedOrder(order);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
    setReturnReason('');
    setRating(0);
    setReviewText('');
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOrders = orders.map(o => 
      o.id === selectedOrder.id ? { ...o, status: 'Returned', returnReason } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('sunwise_orders', JSON.stringify(updatedOrders));
    toast.success('Return initiated securely.', { style: { background: '#111827', color: '#F87171', border: '1px solid rgba(248,113,113,0.3)' } });
    closeModal();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOrders = orders.map(o => 
      o.id === selectedOrder.id ? { ...o, rated: true, rating, reviewText } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('sunwise_orders', JSON.stringify(updatedOrders));
    toast.success('Review submitted! Thank you.', { style: { background: '#111827', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.3)' } });
    closeModal();
  };

  return (
    <div className="min-h-screen py-24 px-6 lg:px-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">My Orders</h1>
        <p className="text-lg text-muted-foreground">Track your solar hardware shipments and manage your installations.</p>
      </motion.div>

      {orders.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-muted-foreground">No active orders found.</h2>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {orders.map((order, i) => (
            <GlassCard key={order.id} delay={i * 0.1} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">{order.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{order.seller.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {order.systemData.totalKw}kW System • {order.systemData.panelCount} Panels
                  </div>
                </div>
                <div className="lg:text-right">
                  <div className="text-2xl font-mono text-solar-green font-bold">₹{order.totalCost.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Ordered on {new Date(order.date).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
                  
                  {['Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                    const statusIndex = ['Processing', 'Shipped', 'Delivered'].indexOf(order.status);
                    const isCompleted = idx <= Math.max(0, statusIndex);
                    const isReturned = order.status === 'Returned';
                    
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isReturned && step === 'Delivered' ? 'bg-red-500/20 border-red-500 text-red-500' : isCompleted ? 'bg-primary border-primary text-black scale-110 shadow-[0_0_20px_rgba(0,229,160,0.5)]' : 'bg-background border-white/20 text-muted-foreground'}`}>
                          {isReturned && step === 'Delivered' ? <AlertTriangle className="w-4 h-4" /> : step === 'Processing' ? <Package className="w-4 h-4" /> : step === 'Shipped' ? <Truck className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isReturned && step === 'Delivered' ? 'text-red-500' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isReturned && step === 'Delivered' ? 'Returned' : step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex gap-3 justify-end border-t border-white/10 pt-6">
                  {order.status !== 'Returned' && (
                    <button 
                      onClick={() => openModal('return', order)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" /> Issue with Item?
                    </button>
                  )}
                  
                  {order.status === 'Delivered' && !order.rated && (
                    <button 
                      onClick={() => openModal('review', order)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-primary text-black rounded-lg hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,229,160,0.2)]"
                    >
                      <Star className="w-4 h-4" fill="currentColor" /> Rate Seller
                    </button>
                  )}

                  {order.rated && (
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                      ✓ Review Submitted
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Return & Review Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#0A0F1E] border border-white/10 shadow-2xl rounded-2xl p-8 max-w-md w-full z-10">
              <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
              
              {activeModal === 'return' ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Initiate Return</h3>
                  <p className="text-sm text-muted-foreground mb-6">If your hardware arrived damaged or the configuration was incorrect, please provide details below.</p>
                  
                  <form onSubmit={handleReturnSubmit} className="space-y-4">
                    <textarea 
                      required
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      placeholder="Explain the issue (e.g. Broken panels during transit)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-red-500 h-32"
                    />
                    <div className="p-4 bg-muted/5 rounded-xl border border-white/5 border-dashed text-center text-xs text-muted-foreground cursor-pointer hover:bg-muted/10 transition-colors">
                      + Upload Photos of Damage (Simulated)
                    </div>
                    <button type="submit" className="w-full py-4 bg-red-500 text-white font-bold rounded-xl mt-4">Submit Return Request</button>
                  </form>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-primary" fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Rate {selectedOrder?.seller.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">How was the installation and hardware quality?</p>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div className="flex items-center gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          type="button" 
                          key={star} 
                          onClick={() => setRating(star)}
                          className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-white/20'}`}
                        >
                          <Star className="w-8 h-8" fill="currentColor" />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      required
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary h-32"
                    />
                    <button type="submit" disabled={!rating} className="w-full py-4 bg-primary text-black font-bold rounded-xl disabled:opacity-50">Submit Review</button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
