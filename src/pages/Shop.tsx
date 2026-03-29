import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, MapPin, Zap, Wrench, CreditCard, Check, ShieldAlert, RefreshCcw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

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
  const [paymentTab, setPaymentTab] = useState('Card');
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

      {/* High-Fidelity Payment Modal (Razorpay/QR Flow) */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowCheckout(false)} 
              className="absolute inset-0 bg-background/90 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-[#0A0F1E] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-3xl w-full max-w-md z-10 overflow-hidden"
            >
              {/* Razorpay-style branding header */}
              <div className="bg-[#182138] p-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,229,160,0.5)]">
                  <span className="text-solar-navy font-black text-xl">S</span>
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Solar Bharat AI</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Order #{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Amount Payable</div>
                  <div className="text-3xl font-mono text-primary font-bold">₹{totalCost.toLocaleString('en-IN')}</div>
                </div>

                {/* Payment Tabs */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl mb-6">
                  {['Card', 'UPI / QR'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setPaymentTab(tab)} 
                      className={cn(
                        "flex-1 py-2 text-[10px] uppercase font-black rounded-lg transition-all",
                        paymentTab === tab ? "bg-primary text-solar-navy" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[220px]">
                  {paymentTab === 'Card' ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Card Number</label>
                        <div className="relative">
                           <input type="text" placeholder="4444 4444 4444 4444" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-primary outline-none transition-all" />
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold">VISA</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Exp. Date</label>
                          <input type="text" placeholder="MM / YY" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">CVV</label>
                          <input type="password" placeholder="***" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-primary outline-none" />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center">
                      <div className="w-40 h-40 bg-white p-3 rounded-2xl mb-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                         {/* High-fidelity SVG QR Code mock */}
                         <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                            <rect width="100" height="100" fill="white" />
                            {[...Array(25)].map((_, i) => (
                              <rect 
                                key={i} 
                                x={(i % 5) * 20 + 2} 
                                y={Math.floor(i / 5) * 20 + 2} 
                                width="16" 
                                height="16" 
                                fill={Math.random() > 0.5 ? "black" : "#00E59E"} 
                              />
                            ))}
                            <rect x="35" y="35" width="30" height="30" fill="white" />
                            <circle cx="50" cy="50" r="10" fill="black" />
                         </svg>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Scan with BHIM / GPay / PhonePe</p>
                      <div className="mt-4 w-full flex items-center gap-2">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[9px] text-muted-foreground uppercase font-black italic">Solar Pay Enabled</span>
                        <div className="h-px bg-white/10 flex-1" />
                      </div>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={processing}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mt-8 transition-all active:scale-95",
                    processing ? "bg-white/10 text-muted-foreground" : "bg-primary text-solar-navy shadow-[0_0_30px_rgba(0,229,160,0.4)] hover:shadow-primary/60"
                  )}
                >
                  {processing ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>CONFIRM PAYMENT & PLOT ORDER</>
                  )}
                </button>
                
                <p className="text-[9px] text-center text-muted-foreground mt-4 flex items-center justify-center gap-1 uppercase font-bold opacity-30 tracking-tighter">
                   <ShieldCheck size={10} /> 256-Bit SSL AES Encryption · TCI Compliant
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
