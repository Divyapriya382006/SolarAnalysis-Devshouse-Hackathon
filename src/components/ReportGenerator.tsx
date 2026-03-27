import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { FileText, Download, Share2, Check, Globe, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const languages = ['English', 'Hindi', 'Tamil', 'Telugu'];

const sections = [
  { name: 'System Overview', default: true },
  { name: 'Cost Breakdown', default: true },
  { name: 'ROI Analysis', default: true },
  { name: 'Subsidy Details', default: true },
  { name: 'Energy Forecast', default: true },
  { name: 'Carbon Credits', default: false },
  { name: 'Weather Analysis', default: false },
  { name: 'Maintenance Schedule', default: false },
];

export default function ReportGenerator() {
  const [language, setLanguage] = useState('English');
  const [includedSections, setIncludedSections] = useState(
    sections.reduce((acc, s) => ({ ...acc, [s.name]: s.default }), {} as Record<string, boolean>)
  );
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const toggleSection = (name: string) => {
    setIncludedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const pageCount = Object.values(includedSections).filter(Boolean).length + 2;

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      toast.success('Report generated successfully!', {
        style: { background: '#111827', color: '#F0F4FF', border: '1px solid rgba(0,229,160,0.3)' },
        iconTheme: { primary: '#00E5A0', secondary: '#0A0F1E' },
      });
    }, 2000);
  };

  const handleShare = (type: string) => {
    if (type === 'whatsapp') {
      const msg = encodeURIComponent("Check out my solar rooftop analysis from Solar Bharat AI! 🌞");
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    } else if (type === 'email') {
      window.location.href = 'mailto:?subject=My Solar Rooftop Report&body=Check out my solar analysis!';
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!', {
        style: { background: '#111827', color: '#F0F4FF', border: '1px solid rgba(0,229,160,0.3)' },
      });
    }
  };

  return (
    <section id="report" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-primary"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Smart Report Generator
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-12 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Generate a comprehensive PDF report of your solar analysis.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <GlassCard className="min-h-[500px] flex flex-col" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-solar-green" />
            <h3 className="text-lg font-semibold">Report Preview</h3>
            <span className="ml-auto text-xs font-mono-data text-solar-muted">{pageCount} pages</span>
          </div>
          <div className="flex-1 rounded-xl bg-foreground/5 p-6 relative overflow-hidden">
            {/* Mock report preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                <div className="w-8 h-8 rounded bg-solar-green/20" />
                <div>
                  <div className="text-sm font-bold">Solar Bharat AI</div>
                  <div className="text-[10px] text-solar-muted">Rooftop Solar Analysis Report</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded bg-foreground/10 w-3/4" />
                <div className="h-2 rounded bg-foreground/10 w-full" />
                <div className="h-2 rounded bg-foreground/10 w-5/6" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded bg-foreground/5 border border-border/30" />
                ))}
              </div>
              <div className="h-24 rounded bg-foreground/5 border border-border/30" />
              <div className="space-y-2">
                <div className="h-2 rounded bg-foreground/10 w-2/3" />
                <div className="h-2 rounded bg-foreground/10 w-full" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-mono-data text-solar-muted">
              {language}
            </div>
          </div>
        </GlassCard>

        {/* Configuration */}
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-solar-indigo" />
              <h3 className="text-sm font-semibold">Language</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    language === lang
                      ? 'bg-solar-green text-solar-navy font-semibold'
                      : 'glass text-solar-muted hover:text-solar-text'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <h3 className="text-sm font-semibold mb-4">Include Sections</h3>
            <div className="space-y-3">
              {sections.map((section, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggleSection(section.name)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                      includedSections[section.name]
                        ? 'bg-solar-green'
                        : 'glass'
                    }`}
                  >
                    {includedSections[section.name] && <Check size={12} className="text-solar-navy" />}
                  </div>
                  <span className="text-sm text-solar-text group-hover:text-solar-green transition-colors">{section.name}</span>
                </label>
              ))}
            </div>
          </GlassCard>

          {/* Generate button */}
          <motion.button
            onClick={handleGenerate}
            disabled={generating}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              generated
                ? 'bg-solar-green text-solar-navy'
                : 'bg-solar-green text-solar-navy'
            }`}
            style={{ boxShadow: '0 0 30px rgba(0,229,160,0.3)' }}
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : generated ? (
              <>
                <Download size={18} />
                Download PDF
              </>
            ) : (
              <>
                <FileText size={18} />
                Generate Report
              </>
            )}
          </motion.button>

          {/* Share options */}
          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              {[
                { label: 'WhatsApp', action: 'whatsapp' },
                { label: 'Email', action: 'email' },
                { label: 'Copy Link', action: 'copy' },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleShare(opt.action)}
                  className="flex-1 py-2 glass rounded-lg text-xs text-solar-muted hover:text-solar-green transition-colors flex items-center justify-center gap-1"
                >
                  <Share2 size={12} />
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
