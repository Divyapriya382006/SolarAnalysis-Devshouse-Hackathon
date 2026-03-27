import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, MapPin, Zap, Wrench, CreditCard, Check, ShieldAlert } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '@/contexts/NotificationContext';

const mockSellers = [
  { id: 's1', name: 'Tata Power Solar', rating: 4.9, reviews: 1240, location: 'Bengaluru, KA', distance: '12 km', pricePerWatt: 45, tier: 'Premium', verified: true },
  { id: 's2', name: 'Luminous Solar Solutions', rating: 4.7, reviews: 856, location: 'Bengaluru, KA', distance: '18 km', pricePerWatt: 42, tier: 'Standard', verified: true },
  { id: 's3', name: 'Loom Solar Official', rating: 4.8, reviews: 2104, location: 'Mumbai, MH', distance: '850 km', pricePerWatt: 48, tier: 'Premium', verified: false, shippingDays: 4 },
];

export default function Shop() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [addInstall, setAddInstall] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { push } = useNotifications();

  useEffect(() => {
    const data = localStorage.getItem('solar_rules_analysis');
    if (data) setAnalysisData(JSON.parse(data));
  }, []);

  if (!analysisData) {
    return (
      <div className="min-h-screen py-24 px-8 flex items-center justify-center">
        <GlassCard className="text-center max-w-lg">
          <ShieldAlert className="w-12 h-12 text-solar-amber mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No System Configuration Found</h2>
          <p className="text-muted-foreground mb-6">Please design your solar system in the AR Designer first to get personalized seller recommendations.</p>
          <button onClick={() => navigate('/ar-designer')} className="px-6 py-3 bg-solar-green text-solar-navy font-bold rounded-xl w-full">Go to AR Designer</button>
        </GlassCard>
      </div>
    );
  }

  const { systemData } = analysisData;
  const seller = mockSellers.find(s => s.id === selectedSeller);
  const basePrice = seller ? systemData.totalKw * 1000 * seller.pricePerWatt : 0;
  const installCost = addInstall ? 15000 : 0;
  const totalCost = basePrice + installCost;

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      
      // Save order to Local Storage
      const newOrder = {
        id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date().toISOString(),
        systemData,
        seller,
        installationIncluded: addInstall,
        totalCost,
        status: 'Processing', // Processing -> Shipped -> Delivered
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
      localStorage.setItem('sunwise_orders', JSON.stringify([newOrder, ...existingOrders]));
      
      // Notify the customer
      push({
        type: 'order',
        title: '🎉 Order Confirmed!',
        message: `Your ${systemData.totalKw}kW solar system from ${seller?.name} is now being processed.`,
        role: 'customer',
      });
      // Notify the seller
      push({
        type: 'order',
        title: '📦 New Order Received!',
        message: `A customer ordered a ${systemData.totalKw}kW system (${systemData.panelCount} panels). ${addInstall ? 'Installation included.' : ''}`,
        role: 'seller',
      });
      
      toast.success('Payment Successful! Order placed.', {
        style: { background: '#111827', color: '#00E5A0', border: '1px solid rgba(0,229,160,0.3)' }
      });
      navigate('/orders');
    }, 2500);
  };

  return (
    <div className="min-h-screen py-24 px-6 lg:px-24 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-4">AI Seller Recommendations</h1>
        <p className="text-lg text-muted-foreground">Based on your {systemData.totalKw}kW requirement, we have matched you with the best verified suppliers in your region.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {mockSellers.map((s, i) => {
            const isSelected = selectedSeller === s.id;
            const cost = systemData.totalKw * 1000 * s.pricePerWatt;
            return (
              <GlassCard 
                key={s.id} 
                delay={i * 0.1}
                className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary/50' : 'hover:border-primary/50'}`}
              >
                <div onClick={() => setSelectedSeller(s.id)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {s.name}
                        {s.verified && <ShieldCheck className="w-5 h-5 text-solar-green" />}
                      </h3>
                      <div className="flex items-center gap-4 text-xs mt-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-solar-amber fill-current" /> {s.rating} ({s.reviews})</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location} ({s.distance})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono text-solar-green font-bold">₹{cost.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-muted-foreground">₹{s.pricePerWatt}/Watt • {s.tier} Kit</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
                    <Zap className="w-3 h-3" /> Exact Configuration Match
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Checkout Sidebar */}
        <div className="space-y-6">
          <GlassCard className="sticky top-24">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Order Summary</h3>
            
            {!selectedSeller ? (
              <div className="text-sm text-muted-foreground text-center py-8">Select a supplier to view your checkout summary.</div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Solar Hardware ({systemData.totalKw}kW)</span>
                    <span className="font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:border-primary/50 transition-colors mt-4">
                    <input 
                      type="checkbox" 
                      checked={addInstall}
                      onChange={(e) => setAddInstall(e.target.checked)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1">Add Professional Installation <Wrench className="w-3 h-3 text-solar-amber" /></div>
                      <div className="text-[10px] text-muted-foreground mt-1">Includes grid-syncing, scaffolding, and a 25-yr maintenance contract via Sunwise.</div>
                    </div>
                    <div className="ml-auto text-sm font-mono">+₹15,000</div>
                  </label>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-muted-foreground font-bold">Total (Incl. Tax)</span>
                    <span className="text-3xl font-mono text-primary font-bold">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-[0_0_30px_rgba(0,229,160,0.3)] hover:scale-[1.02] flex items-center justify-center gap-2 transition-transform"
                  >
                    Proceed to Payment <CreditCard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Mock Stripe Payment Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCheckout(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#0A0F1E] border border-white/10 shadow-2xl rounded-2xl p-8 max-w-md w-full z-10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              <h3 className="text-2xl font-bold mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground mb-8">Powered by simulated Stripe/Razorpay flow.</p>
              
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Card Number</label>
                  <input type="text" value="4444 4444 4444 4444" readOnly className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-muted-foreground font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Expiry Date</label>
                    <input type="text" value="12/28" readOnly className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-muted-foreground font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">CVC</label>
                    <input type="text" value="123" readOnly className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-muted-foreground font-mono" />
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {processing ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <>Pay ₹{totalCost.toLocaleString('en-IN')} securely</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
