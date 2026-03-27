import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Zap, Shield, User, ArrowRight, Sun } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import SolarLogo from '@/components/SolarLogo';

export default function Login() {
  const [isSeller, setIsSeller] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the hardcoded AuthContext login logic
    login(isSeller ? 'seller' : 'customer');
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isSeller ? 'bg-secondary' : 'bg-primary'}`} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10"
      >
        {/* Left Side: Branding & Info */}
        <div className="flex flex-col justify-center gap-8 pl-4 lg:pl-12">
          <div className="flex items-center gap-4">
            <SolarLogo size={48} />
            <h1 className="text-4xl font-display font-bold">Sunwise <span className="text-primary">Harmony</span></h1>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isSeller ? 'seller' : 'customer'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">
                {isSeller ? 'Empower the Next Generation of Energy.' : 'Own Your Energy Future.'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                {isSeller 
                  ? 'Join the fastest-growing solar marketplace. Manage your customers, track orders, and grow your renewable business.'
                  : 'Design your perfect solar roof, calculate your exact ROI, and shop from verified local installers.'}
              </p>
              
              <div className="space-y-4 mt-8">
                {[
                  isSeller ? { icon: <Shield size={20} className="text-secondary"/>, text: 'Verified Seller Dashboard' } : { icon: <Home size={20} className="text-primary"/>, text: 'AR Rooftop Designer' },
                  isSeller ? { icon: <Zap size={20} className="text-secondary"/>, text: 'AI Customer Matching' } : { icon: <Zap size={20} className="text-primary"/>, text: 'Instant AI Cost Savings' },
                  isSeller ? { icon: <Sun size={20} className="text-secondary"/>, text: 'Order & Installation Pipeline' } : { icon: <Sun size={20} className="text-primary"/>, text: 'Shop Top Solar Brands' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSeller ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                      {feature.icon}
                    </div>
                    <span className="font-semibold">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-8 rounded-3xl border-white/10" hover={false}>
            <div className="flex bg-white/5 rounded-full p-1 mb-8">
              <button
                onClick={() => setIsSeller(false)}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${!isSeller ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'}`}
              >
                Customer
              </button>
              <button
                onClick={() => setIsSeller(true)}
                className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${isSeller ? 'bg-secondary text-black shadow-lg shadow-secondary/20' : 'text-muted-foreground hover:text-white'}`}
              >
                Solar Seller
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={isSeller ? "sales@tatasolar.com" : "raj@example.com"}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="password"
                    value={"hardcoded123"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isSeller ? 'bg-secondary shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-primary shadow-[0_0_30px_rgba(0,229,160,0.3)]'}`}
                >
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                (Click sign in to continue with mock credentials)
              </p>
            </form>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
