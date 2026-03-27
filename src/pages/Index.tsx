import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ARDesigner from '@/components/ARDesigner';
import EnergyPrediction from '@/components/EnergyPrediction';
import CostCalculator from '@/components/CostCalculator';
import DigitalTwin from '@/components/DigitalTwin';
import NeighbourhoodHeatmap from '@/components/NeighbourhoodHeatmap';
import LiveSimulation from '@/components/LiveSimulation';
import AIAssistant from '@/components/AIAssistant';
import CarbonCredits from '@/components/CarbonCredits';
import WeatherImpact from '@/components/WeatherImpact';
import ReportGenerator from '@/components/ReportGenerator';
import PersonalizationForm from '@/components/PersonalizationForm';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const defaultSystem = { panelCount: 8, totalKw: 3.2, annualKwh: 4480 };

export default function Index() {
  const [activeSection, setActiveSection] = useState('hero');
  const [address, setAddress] = useState('');
  const [systemData, setSystemData] = useState(defaultSystem);
  const [started, setStarted] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const scrollProgress = useScrollProgress();

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAddressConfirm = (addr: string) => {
    setAddress(addr);
    setStarted(true);
    setTimeout(() => handleNavigate('ar-designer'), 500);
  };

  const handleCommitLayout = (data: { panelCount: number; totalKw: number; annualKwh: number }) => {
    setSystemData(data);
    setShowPersonalization(true);
  };

  const handlePersonalizationComplete = () => {
    setShowPersonalization(false);
    setTimeout(() => handleNavigate('prediction'), 300);
  };

  // Track active section on scroll
  useEffect(() => {
    const sections = ['hero', 'ar-designer', 'prediction', 'calculator', 'digital-twin', 'heatmap', 'live-sim', 'carbon', 'weather', 'report'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [started]);

  return (
    <div className="min-h-screen bg-solar-navy text-solar-text">
      {/* Scroll progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* Toast */}
      <Toaster position="bottom-right" />

      {/* Navigation */}
      <Navigation activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Header */}
      {started && (
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-16 right-0 h-12 glass z-40 flex items-center px-6 lg:left-16"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <motion.span
            key={activeSection}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-semibold capitalize"
          >
            {activeSection.replace(/-/g, ' ')}
          </motion.span>
          {address && (
            <div className="ml-auto flex items-center gap-2">
              <div className="glass rounded-full px-3 py-1 text-xs text-solar-muted truncate max-w-[200px]">
                📍 {address.split(',')[0]}
              </div>
            </div>
          )}
        </motion.header>
      )}

      {/* Content */}
      <main className={started ? 'pt-12' : ''}>
        <HeroSection onAddressConfirm={handleAddressConfirm} />

        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ARDesigner onCommit={handleCommitLayout} address={address} />
            <EnergyPrediction systemData={systemData} />
            <CostCalculator systemData={systemData} />
            <DigitalTwin systemData={systemData} />
            <NeighbourhoodHeatmap />
            <LiveSimulation />
            <CarbonCredits systemData={{ annualKwh: systemData.annualKwh }} />
            <WeatherImpact />
            <ReportGenerator />

            {/* Footer */}
            <footer className="py-16 px-6 lg:pl-24 text-center border-t border-border/30">
              <div className="text-sm text-solar-muted">
                © 2025 Solar Bharat AI — Powering India's solar revolution 🌞
              </div>
              <div className="text-xs text-solar-muted/50 mt-2">
                Made with clean energy ⚡
              </div>
            </footer>
          </motion.div>
        )}
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Rules Personalization Modal */}
      {showPersonalization && (
        <PersonalizationForm 
          onComplete={handlePersonalizationComplete}
          systemKw={systemData.totalKw}
        />
      )}
    </div>
  );
}
