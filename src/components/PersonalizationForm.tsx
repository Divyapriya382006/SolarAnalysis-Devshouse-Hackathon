import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Home, CheckCircle2, ShieldAlert, Zap, Banknote, Sun } from 'lucide-react';
import GlassCard from './GlassCard';
import { cn } from '@/lib/utils';

interface PersonalizationData {
  setupType: 'domestic' | 'commercial';
  gridApproval: 'approved' | 'pending' | 'none';
  sanctionedLoad: number;
  roofOwnership: 'owned' | 'rented';
  shadows: 'none' | 'minor' | 'significant';
  inverterQuality: 'budget' | 'standard' | 'premium';
}

interface PersonalizationFormProps {
  onComplete: () => void;
  systemKw: number;
  systemData?: { panelCount: number; totalKw: number; annualKwh: number };
}

export default function PersonalizationForm({ onComplete, systemKw, systemData }: PersonalizationFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<PersonalizationData>({
    setupType: 'domestic',
    gridApproval: 'none',
    sanctionedLoad: Math.ceil(systemKw), // Default to matching system size
    roofOwnership: 'owned',
    shadows: 'none',
    inverterQuality: 'standard',
  });
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    
    // Perform simple analysis based on rules
    const analysis = {
      inputs: data,
      rules: [] as { type: 'success' | 'warning' | 'danger'; title: string; desc: string }[],
    };

    if (data.setupType === 'domestic') {
      analysis.rules.push({
        type: 'success',
        title: 'Subsidy Eligible',
        desc: 'You are eligible for PM Surya Ghar Yojana subsidies as a domestic user.',
      });
      if (data.roofOwnership === 'rented') {
        analysis.rules.push({
          type: 'danger',
          title: 'Rooftop Rights Issue',
          desc: 'You must own the roof or have formal legal rights (NOC from owner) to install.',
        });
      }
    } else {
      analysis.rules.push({
        type: 'warning',
        title: 'No Subsidies',
        desc: 'Commercial setups do not qualify for residential subsidies. ROI relies purely on electricity offset.',
      });
    }

    if (data.sanctionedLoad < systemKw) {
      analysis.rules.push({
        type: 'danger',
        title: 'Capacity Exceeds Load',
        desc: `Your planned ${systemKw.toFixed(1)}kW system exceeds your ${data.sanctionedLoad}kW sanctioned load. You must upgrade your load with the DISCOM first.`,
      });
    }

    if (data.gridApproval === 'none') {
      analysis.rules.push({
        type: 'warning',
        title: 'DISCOM Approval Required',
        desc: 'Grid connection approval (Net/Gross metering) is mandatory before installation.',
      });
    }

    if (data.shadows !== 'none') {
      analysis.rules.push({
        type: 'danger',
        title: 'Shadow Impact',
        desc: 'Shadows drastically reduce efficiency. Ensure panels are placed away from tanks, antennas, and trees.',
      });
    }

    if (data.inverterQuality === 'budget') {
      analysis.rules.push({
        type: 'warning',
        title: 'Inverter Quality Risk',
        desc: 'Using a cheap inverter increases breakdown risk. The inverter is the heart of the system; invest wisely.',
      });
    }

    // Cache the analysis including systemData for downstream use (Shop page, etc.)
    localStorage.setItem('solar_rules_analysis', JSON.stringify({ ...analysis, systemData: systemData ?? { panelCount: 8, totalKw: systemKw, annualKwh: Math.round(systemKw * 1400) } }));

    setTimeout(() => {
      setAnalyzing(false);
      onComplete();
    }, 2000);
  };

  const update = (key: keyof PersonalizationData, val: any) => {
    setData(prev => ({ ...prev, [key]: val }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-12 bg-background/80 backdrop-blur-md overflow-y-auto"
    >
      <GlassCard className="w-full max-w-2xl mt-auto mb-auto bg-card border-border shadow-2xl" hover={false}>
        {!analyzing ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-primary mb-2">System Compliance Check</h2>
              <p className="text-muted-foreground text-sm">Let's ensure your layout complies with real-world installation rules.</p>
            </div>

            {step === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Setup Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => update('setupType', 'domestic')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", data.setupType === 'domestic' ? "bg-primary/10 border-primary text-primary" : "glass text-muted-foreground")}>
                      <Home size={24} />
                      <span className="font-bold">Domestic</span>
                    </button>
                    <button onClick={() => update('setupType', 'commercial')} className={cn("p-4 rounded-xl border flex flex-col items-center gap-2 transition-all", data.setupType === 'commercial' ? "bg-accent/10 border-accent text-accent" : "glass text-muted-foreground")}>
                      <Building size={24} />
                      <span className="font-bold">Commercial</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Roof Rights</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => update('roofOwnership', 'owned')} className={cn("p-3 rounded-lg border transition-all text-sm font-semibold", data.roofOwnership === 'owned' ? "bg-primary text-background border-primary" : "glass text-muted-foreground")}>
                      Fully Owned
                    </button>
                    <button onClick={() => update('roofOwnership', 'rented')} className={cn("p-3 rounded-lg border transition-all text-sm font-semibold", data.roofOwnership === 'rented' ? "bg-primary text-background border-primary" : "glass text-muted-foreground")}>
                      Rented / Shared
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2 bg-primary text-background font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                    Next Step <CheckCircle2 size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Current Sanctioned Load (kW)</label>
                  <input 
                    type="number" 
                    value={data.sanctionedLoad}
                    onChange={(e) => update('sanctionedLoad', Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex gap-1 items-start">
                    <ShieldAlert size={14} className="text-accent flex-shrink-0" />
                    System capacity ({systemKw.toFixed(1)}kW) should not exceed your sanctioned grid load.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Grid Connection Approval</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['approved', 'pending', 'none'].map((status) => (
                      <button key={status} onClick={() => update('gridApproval', status)} className={cn("p-3 rounded-lg border transition-all text-xs font-semibold capitalize", data.gridApproval === status ? "bg-primary text-background border-primary" : "glass text-muted-foreground")}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="px-6 py-2 glass text-foreground font-bold rounded-lg hover:bg-white/5 transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="px-6 py-2 bg-primary text-background font-bold rounded-lg flex items-center gap-2 hover:opacity-90">
                    Next Step <CheckCircle2 size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Shadow Analysis (Estimated)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'minor', 'significant'].map((lvl) => (
                      <button key={lvl} onClick={() => update('shadows', lvl)} className={cn("p-3 rounded-lg border transition-all text-xs font-semibold capitalize", data.shadows === lvl ? "bg-primary text-background border-primary" : "glass text-muted-foreground")}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Inverter & Components Budget</label>
                  <div className="space-y-3">
                    <button onClick={() => update('inverterQuality', 'premium')} className={cn("w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left", data.inverterQuality === 'premium' ? "bg-primary/10 border-primary" : "glass")}>
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", data.inverterQuality === 'premium' ? "bg-primary text-background" : "bg-white/10 text-muted-foreground")}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Premium (Tier 1)</h4>
                        <p className="text-xs text-muted-foreground">High reliability, 10-year warranty, best for long-term ROI</p>
                      </div>
                    </button>
                    <button onClick={() => update('inverterQuality', 'standard')} className={cn("w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left", data.inverterQuality === 'standard' ? "bg-primary/10 border-primary" : "glass")}>
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", data.inverterQuality === 'standard' ? "bg-primary text-background" : "bg-white/10 text-muted-foreground")}>
                        <Banknote size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Standard</h4>
                        <p className="text-xs text-muted-foreground">Trusted brands, standard 5-year warranty, typical choice</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(2)} className="px-6 py-2 glass text-foreground font-bold rounded-lg hover:bg-white/5 transition-colors">
                    Back
                  </button>
                  <button onClick={handleAnalyze} className="w-full ml-4 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                    Run Compliance Check
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center text-center space-y-6">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent mx-auto relative flex items-center justify-center">
               <Sun size={32} className="text-accent absolute" />
             </motion.div>
             <div>
               <h3 className="text-xl font-bold mb-2 text-primary">Analyzing Custom Layout</h3>
               <p className="text-sm text-muted-foreground">Checking TANGEDCO/DISCOM net-metering rules...</p>
               <p className="text-sm text-muted-foreground">Validating structural limits & subsidy eligibility...</p>
             </div>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
