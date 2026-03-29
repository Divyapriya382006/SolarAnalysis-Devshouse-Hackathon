import { motion } from 'framer-motion';
import SolarLogo from './SolarLogo';
import {
  Home, Box, BarChart3, Calculator, Clock, Map,
  Activity, MessageCircle, Leaf, Cloud, FileText,
  ShoppingCart, Package, LayoutDashboard, LogOut,
  Users, Truck, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

const customerItems = [
  { icon: Home, label: 'Home', id: 'hero' },
  { icon: Box, label: 'AR Designer', id: 'ar-designer' },
  { icon: BarChart3, label: 'Prediction', id: 'prediction' },
  { icon: Calculator, label: 'Calculator', id: 'calculator' },
  { icon: Clock, label: 'Digital Twin', id: 'digital-twin' },
  { icon: Map, label: 'Heatmap', id: 'heatmap' },
  { icon: Activity, label: 'Live Sim', id: 'live-sim' },
  { icon: MessageCircle, label: 'AI Chat', id: 'ai-chat' },
  { icon: Leaf, label: 'Carbon', id: 'carbon' },
  { icon: Cloud, label: 'Weather', id: 'weather' },
  { icon: FileText, label: 'Report', id: 'report' },
  { icon: ShoppingCart, label: 'Shop Solar', id: 'shop' },
  { icon: Package, label: 'My Orders', id: 'orders' },
];

const sellerItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'seller-dashboard' },
  { icon: Package, label: 'Orders', id: 'seller/orders' },
  { icon: ShoppingCart, label: 'Catalogue', id: 'seller/catalogue' },
  { icon: Users, label: 'Customers', id: 'seller/customers' },
  { icon: Truck, label: 'Transport', id: 'seller/transportation' },
  { icon: Star, label: 'Reviews', id: 'seller/reviews' },
];

interface NavigationProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const { user, logout } = useAuth();
  const currentItems = user?.role === 'seller' ? sellerItems : customerItems;
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-16 flex-col items-center py-6 glass z-50"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mb-8">
          <SolarLogo size={32} />
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 overflow-y-auto w-full">
          {currentItems.map((item, i) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onNavigate(item.id)}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors group"
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(0, 229, 160, 0.15)', border: '1px solid rgba(0, 229, 160, 0.3)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 transition-colors ${isActive ? 'text-solar-green' : 'text-solar-muted group-hover:text-solar-text'}`}
                />
              </motion.button>
            );
          })}
        </div>
        {user && (
          <div className="flex flex-col items-center gap-2 mt-auto mb-2">
            <NotificationBell />
            <button 
              onClick={logout}
              title="Log Out"
              className="w-10 h-10 flex items-center justify-center text-solar-muted hover:text-solar-danger transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass z-50 flex justify-around items-center py-2 px-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {currentItems.slice(0, 5).map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon size={18} className={isActive ? 'text-solar-green' : 'text-solar-muted'} />
              <span className={`text-[10px] ${isActive ? 'text-solar-green' : 'text-solar-muted'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-solar-green"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
