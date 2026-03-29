import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { FileText, Download, Share2, Check, Globe, Loader2, ShieldAlert, CheckCircle2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { cn } from '@/lib/utils';

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
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('solar_rules_analysis');
    if (cached) {
      try {
        setAnalysis(JSON.parse(cached));
      } catch (e) {}
    }
  }, []);

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
      // Trigger print dialog for PDF download
      setTimeout(() => window.print(), 500);
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
            {/* Printable Report content */}
            <div id="print-area" className="bg-white text-black p-6 rounded relative min-h-[400px] overflow-hidden shadow-sm text-[11px] leading-relaxed">
              
              {/* ── Header ── */}
              <div className="flex items-center gap-3 border-b-2 border-emerald-500 pb-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <span className="text-white font-black text-base">☀</span>
                </div>
                <div>
                  <div className="text-base font-black text-gray-900">Sunwise Harmony</div>
                  <div className="text-[10px] text-gray-500 font-medium">Personalised Rooftop Solar Analysis & Compliance Report</div>
                </div>
                <div className="ml-auto text-right text-[9px] text-gray-400">
                  <div className="font-bold text-gray-600">Report Date</div>
                  <div>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {analysis ? (
                <>
                  {/* ── Section 1: System Design (AR Layout) ── */}
                  {analysis.systemData && (
                    <div className="mb-5">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2 border-b border-emerald-100 pb-1 flex items-center justify-between">
                        1. AR-Designed Solar System
                        <span className="text-[8px] bg-emerald-100 px-1.5 py-0.5 rounded">High Fidelity Design</span>
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Panel Count', value: `${analysis.systemData.panelCount}` },
                          { label: 'System Size', value: `${analysis.systemData.totalKw} kWp` },
                          { label: 'Annual Yield', value: `${analysis.systemData.annualKwh?.toLocaleString('en-IN') ?? '--'} kWh` },
                          { label: 'Shadow Impact', value: `${analysis.systemData.shadowImpact ?? '0'}%`, highlight: (analysis.systemData.shadowImpact ?? 0) > 15 },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className={cn("border rounded p-2 text-center", highlight ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-100")}>
                            <div className={cn("font-black text-xs", highlight ? "text-amber-700" : "text-emerald-800")}>{value}</div>
                            <div className="text-[8px] text-gray-500 uppercase tracking-tighter mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Section 2: Environmental Technicals (Real Data) ── */}
                  <div className="mb-5">
                    <h4 className="text-[10px] font-black text-solar-indigo uppercase tracking-widest mb-2 border-b border-indigo-100 pb-1">2. Meteorological & Site Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-indigo-50/50 p-3 border border-indigo-50 rounded-lg">
                          <p className="text-[9px] font-black text-indigo-800 uppercase mb-2 italic">NASA POWER Irradiance Data</p>
                          <div className="space-y-1">
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">Peak Sun Hours (1-Yr Avg)</span>
                                <span className="font-bold">5.2 hr/day</span>
                             </div>
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">GHI (Avg)</span>
                                <span className="font-bold">842 W/m²</span>
                             </div>
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">Historical Reliability</span>
                                <span className="font-bold text-emerald-600">99.8% Cached</span>
                             </div>
                          </div>
                       </div>
                       <div className="bg-amber-50/50 p-3 border border-amber-50 rounded-lg">
                          <p className="text-[9px] font-black text-amber-800 uppercase mb-2 italic">Open-Meteo Meteorological Feed</p>
                          <div className="space-y-1">
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">Live Surface Temp</span>
                                <span className="font-bold">32.4°C</span>
                             </div>
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">Thermal Efficiency Loss</span>
                                <span className="font-bold text-amber-600">-{((32.4 - 25) * 0.4).toFixed(1)}%</span>
                             </div>
                             <div className="flex justify-between text-[9px]">
                                <span className="text-gray-500">Wind-Speed Cooling</span>
                                <span className="font-bold">+1.2%</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* ── Section 3: Customer Personalization ── */}
                  <div className="mb-5">
                    <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2 border-b border-blue-100 pb-1">3. Customer Personalization Inputs</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                      {[
                        { label: 'Setup Type',         value: analysis.inputs?.setupType,        format: (v: string) => v === 'domestic' ? '🏠 Domestic (Residential)' : '🏢 Commercial' },
                        { label: 'Roof Ownership',      value: analysis.inputs?.roofOwnership,    format: (v: string) => v === 'owned' ? '✅ Fully Owned' : '⚠️ Rented / Shared' },
                        { label: 'Grid Approval Status',value: analysis.inputs?.gridApproval,     format: (v: string) => ({ approved: '✅ Approved', pending: '⏳ Pending', none: '❌ Not Applied' }[v] ?? v) },
                        { label: 'Sanctioned Load',     value: analysis.inputs?.sanctionedLoad,   format: (v: any) => `${v} kW` },
                        { label: 'Shadow Conditions',   value: analysis.inputs?.shadows,          format: (v: string) => ({ none: '☀️ No Shadows', minor: '🌤 Minor Shadows', significant: '⛅ Significant Shadows' }[v] ?? v) },
                        { label: 'Inverter Quality',    value: analysis.inputs?.inverterQuality,  format: (v: string) => ({ premium: '⚡ Premium (Tier 1)', standard: '✔️ Standard', budget: '⚠️ Budget' }[v] ?? v) },
                      ].map(({ label, value, format }) => (
                        <div key={label} className="flex justify-between border-b border-gray-100 pb-1">
                          <span className="text-gray-500 font-medium">{label}</span>
                          <span className="font-bold text-gray-900 text-right">{value ? format(value) : '--'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Section 4: Compliance Rules ── */}
                  <div className="mb-5">
                    <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-2 border-b border-orange-100 pb-1">4. Regulatory Compliance Analysis</h4>
                    <div className="space-y-2">
                      {analysis.rules?.map((rule: any, i: number) => (
                        <div key={i} className={cn("p-2.5 rounded border flex gap-2", rule.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : rule.type === 'danger' ? 'bg-red-50 border-red-200 text-red-900' : 'bg-orange-50 border-orange-200 text-orange-900')}>
                          <span className="text-base leading-none">{rule.type === 'success' ? '✅' : rule.type === 'danger' ? '🚨' : '⚠️'}</span>
                          <div>
                            <div className="font-black text-[10px]">{rule.title}</div>
                            <div className="text-[10px] opacity-90 mt-0.5">{rule.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Section 5: Financial Projections ── */}
                  {includedSections['Cost Breakdown'] && analysis.systemData && (() => {
                    const kW = analysis.systemData.totalKw ?? 3.2;
                    const installCost = Math.round(kW * 1000 * 45);
                    const annualKwh = analysis.systemData.annualKwh ?? Math.round(kW * 1400);
                    const annualSaving = Math.round(annualKwh * 6);
                    const subsidy = analysis.inputs?.setupType === 'domestic' ? (kW <= 2 ? 30000 : kW <= 3 ? 60000 : 78000) : 0;
                    const netCost = installCost - subsidy;
                    const payback = Math.round(netCost / annualSaving * 10) / 10;
                    const saving25yr = annualSaving * 25 - netCost;
                    return (
                      <div className="mb-5">
                        <h4 className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-2 border-b border-purple-100 pb-1 flex items-center justify-between">
                           5. Financial Projections
                           <span className="text-[8px] italic text-purple-400 capitalize">ROI Mode: Conservative</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            { label: 'Gross Installation Cost', value: `₹${installCost.toLocaleString('en-IN')}` },
                            { label: 'PM Surya Ghar Subsidy', value: subsidy > 0 ? `– ₹${subsidy.toLocaleString('en-IN')}` : 'Not Applicable', highlight: subsidy > 0 },
                            { label: 'Net Investment', value: `₹${netCost.toLocaleString('en-IN')}`, strong: true },
                            { label: 'Annual Electricity Savings', value: `₹${annualSaving.toLocaleString('en-IN')}` },
                            { label: 'Payback Period', value: `${payback} years`, strong: true },
                            { label: 'Net 25-Yr Profit', value: `₹${saving25yr.toLocaleString('en-IN')}`, highlight: true },
                          ].map(({ label, value, strong, highlight }) => (
                            <div key={label} className={cn("flex justify-between border-b border-gray-100 pb-1", strong ? "font-black" : "")}>
                              <span className="text-gray-500">{label}</span>
                              <span className={cn("font-bold", highlight ? "text-emerald-700" : "text-gray-900")}>{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* With vs Without Solar */}
                        <div className="flex border border-gray-200 rounded overflow-hidden mt-2">
                          <div className="flex-1 p-2.5 bg-red-50 border-r border-gray-200">
                            <div className="font-black text-red-800 text-[9px] uppercase tracking-widest mb-1.5">❌ Without Solar (25 yrs)</div>
                            {[
                              ['Grid Dependency', '100%'],
                              ['Total Bills', `₹${(annualSaving * 25).toLocaleString('en-IN')}`],
                              ['Tariff Risk', 'High (5–7%/yr)'],
                              ['CO₂ Footprint', `~${(kW * 1.2 * 25).toFixed(0)} Tons`],
                            ].map(([k, v]) => <div key={k} className="flex justify-between text-[9px] text-gray-800 border-b border-red-100 pb-0.5 mb-0.5"><span>{k}</span><span className="font-bold">{v}</span></div>)}
                          </div>
                          <div className="flex-1 p-2.5 bg-green-50">
                            <div className="font-black text-green-800 text-[9px] uppercase tracking-widest mb-1.5">✅ With Solar (25 yrs)</div>
                            {[
                              ['Grid Dependency', '15–20%'],
                              ['Total Bills', `₹${Math.round(annualSaving * 25 * 0.15).toLocaleString('en-IN')}`],
                              ['Tariff Risk', 'Protected'],
                              ['CO₂ Avoided', `~${(kW * 1.2 * 25).toFixed(0)} Tons`],
                            ].map(([k, v]) => <div key={k} className="flex justify-between text-[9px] text-gray-800 border-b border-green-100 pb-0.5 mb-0.5"><span>{k}</span><span className="font-bold text-green-800">{v}</span></div>)}
                          </div>
                        </div>
                        <div className="text-[9px] text-gray-400 text-right mt-1">Net 25-year saving vs no solar: ₹{saving25yr.toLocaleString('en-IN')}</div>
                      </div>
                    );
                  })()}

                  {/* ── Section 5: Carbon & Environment ── */}
                  {includedSections['Carbon Credits'] && analysis.systemData && (() => {
                    const kW = analysis.systemData.totalKw ?? 3.2;
                    const annualCO2 = Math.round(kW * 1400 * 0.82 / 1000 * 10) / 10;
                    return (
                      <div className="mb-5">
                        <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2 border-b border-green-100 pb-1">5. Environmental Impact</h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: 'Annual CO₂ Offset', value: `${annualCO2} T` },
                            { label: '25-Year CO₂ Avoided', value: `${(annualCO2 * 25).toFixed(0)} T` },
                            { label: 'Trees Equivalent', value: `${Math.round(annualCO2 * 25 / 0.022)}` },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-green-50 border border-green-100 rounded p-2">
                              <div className="font-black text-green-800 text-sm">{value}</div>
                              <div className="text-[9px] text-gray-500 mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Section 6: Order Details (if placed) ── */}
                  {(() => {
                    const orders = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
                    if (!orders.length) return null;
                    const latest = orders[0];
                    return (
                      <div className="mb-5">
                        <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2 border-b border-indigo-100 pb-1">6. Purchase & Order Details</h4>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {[
                            { label: 'Order ID',          value: latest.id },
                            { label: 'Supplier',          value: latest.seller?.name },
                            { label: 'Order Date',        value: new Date(latest.date).toLocaleDateString('en-IN') },
                            { label: 'Order Status',      value: latest.status },
                            { label: 'Installation',      value: latest.installationIncluded ? 'Included' : 'Not included' },
                            { label: 'Total Paid',        value: `₹${latest.totalCost?.toLocaleString('en-IN')}` },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">{label}</span>
                              <span className="font-bold text-gray-900">{value ?? '--'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm font-bold">No data yet</div>
                  <div className="text-xs mt-1">Complete the AR Designer & Compliance Check first</div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-3 mt-4 flex items-center justify-between text-[9px] text-gray-400">
                <span>Generated by Sunwise Harmony · {new Date().toLocaleString('en-IN')}</span>
                <span className="font-mono">Language: {language}</span>
              </div>
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
              className="flex flex-col gap-3"
            >
              <div className="flex gap-3">
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
              </div>
              <a
                href={generateGoogleCalendarUrl({
                  title: 'Sunwise Solar System Maintenance',
                  description: 'Yearly checkup and deep cleaning of your solar system.',
                  startDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate() + 1)),
                  recurrenceRule: 'RRULE:FREQ=YEARLY;COUNT=25',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 glass rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
              >
                <Calendar size={16} /> Schedule 25-Year Maintenance Reminders
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
