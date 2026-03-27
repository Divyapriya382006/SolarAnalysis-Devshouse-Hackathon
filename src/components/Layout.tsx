import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AIAssistant from '@/components/AIAssistant';
import PersonalizationForm from '@/components/PersonalizationForm';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

const defaultSystem = { panelCount: 8, totalKw: 3.2, annualKwh: 4480 };

export default function Layout() {
  const [address, setAddress] = useState('');
  const [systemData, setSystemData] = useState(defaultSystem);
  const [started, setStarted] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const scrollProgress = useScrollProgress();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleAddressConfirm = (addr: string) => {
    setAddress(addr);
    setStarted(true);
    setTimeout(() => navigate('/ar-designer'), 500);
  };

  const handleCommitLayout = (data: { panelCount: number; totalKw: number; annualKwh: number }) => {
    setSystemData(data);
    setShowPersonalization(true);
  };

  const handlePersonalizationComplete = () => {
    setShowPersonalization(false);
    setTimeout(() => navigate('/prediction'), 300);
  };

  const activeSectionPath = location.pathname === '/' ? 'hero' : location.pathname.replace('/', '');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <Toaster position="bottom-right" />
      <Navigation activeSection={activeSectionPath} onNavigate={(path) => navigate(path === 'hero' ? '/' : `/${path}`)} />

      {started && location.pathname !== '/' && (
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-16 right-0 h-12 glass z-40 flex items-center px-6 lg:left-16 border-b border-border/30"
        >
          <motion.span
            key={activeSectionPath}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-semibold capitalize"
          >
            {activeSectionPath.replace(/-/g, ' ')}
          </motion.span>
          {address && (
            <div className="ml-auto flex items-center gap-4">
              <div className="glass rounded-full px-3 py-1 text-xs text-muted-foreground truncate max-w-[200px]">
                📍 {address.split(',')[0]}
              </div>
              <button onClick={logout} className="text-muted-foreground hover:text-solar-danger transition-colors" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </motion.header>
      )}

      <main className={started && location.pathname !== '/' ? 'pt-12' : ''}>
        <motion.div
           key={location.pathname}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
        >
          <Outlet context={{ address, started, systemData, handleAddressConfirm, handleCommitLayout }} />
        </motion.div>
      </main>

      {location.pathname !== '/' && started && (
        <footer className="py-16 px-6 lg:pl-24 text-center border-t border-border/30">
          <div className="text-sm text-muted-foreground">
            © 2025 Solar Bharat AI — Powering India's solar revolution 🌞
          </div>
          <div className="text-xs text-muted-foreground/50 mt-2">
            Made with clean energy ⚡
          </div>
        </footer>
      )}

      <AIAssistant />

      {showPersonalization && (
        <PersonalizationForm 
          onComplete={handlePersonalizationComplete}
          systemKw={systemData.totalKw}
          systemData={systemData}
        />
      )}
    </div>
  );
}
