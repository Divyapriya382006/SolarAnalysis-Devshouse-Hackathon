import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Sun } from 'lucide-react';

const quickQuestions = [
  "Is solar worth it for my roof?",
  "How much will I save in 5 years?",
  "Which panel type is best for Chennai?",
  "Explain PM Surya Ghar subsidy",
  "What's my carbon credit value?",
];

const mockResponses: Record<string, string> = {
  default: "Based on your rooftop analysis, I recommend a 3kW system with monocrystalline panels. This would generate approximately 4,200 kWh annually, saving you around ₹31,500 per year. With the PM Surya Ghar subsidy, your net cost would be significantly reduced, with a payback period of about 4 years.",
  "Is solar worth it for my roof?": "Absolutely! Based on your location and roof area, solar is an excellent investment. Your roof receives approximately 5.2 peak sun hours daily. A well-designed system can offset 80-100% of your electricity bill, with ROI typically within 3-5 years after subsidies.",
  "How much will I save in 5 years?": "Over 5 years, your estimated savings would be approximately ₹1,57,500. This accounts for annual generation of ~4,200 kWh at ₹7.5/unit, with 0.7% annual panel degradation factored in. After the payback period, every unit generated is pure profit!",
  "Which panel type is best for Chennai?": "For Chennai's hot and humid climate, I recommend bifacial panels. They perform better in high temperatures and can capture reflected light from the ground. The Adani 450W bifacial module is popular in Tamil Nadu — it handles monsoon diffused light well and maintains 23%+ efficiency.",
  "Explain PM Surya Ghar subsidy": "Under PM Surya Ghar Muft Bijli Yojana: Systems up to 2kW get ₹30,000/kW subsidy, 2-3kW systems get ₹18,000/kW for the additional capacity. So a 3kW system gets ₹60,000 + ₹18,000 = ₹78,000 subsidy. Apply through your local DISCOM portal with KYC documents.",
  "What's my carbon credit value?": "Your system would generate approximately 3.4 tonnes of CO₂ offset per year, equivalent to ~3.4 RECs (Renewable Energy Certificates). At current market rates of ₹2,800-3,200 per REC on IEX, that's ₹9,520-10,880 in additional annual income through carbon credit monetisation.",
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Namaste! 🌞 I\'m your Solar AI assistant. Ask me anything about going solar — costs, subsidies, panel selection, or your specific rooftop.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = mockResponses[userMsg] || mockResponses.default;
    setDisplayedResponse('');

    setTimeout(() => {
      setIsTyping(false);
      let i = 0;
      const typeInterval = setInterval(() => {
        i++;
        setDisplayedResponse(response.slice(0, i));
        if (i >= response.length) {
          clearInterval(typeInterval);
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          setDisplayedResponse('');
        }
      }, 20);
    }, 800);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, displayedResponse]);

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-solar-green flex items-center justify-center z-40 shadow-lg"
        style={{ boxShadow: '0 0 30px rgba(0,229,160,0.3)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 20px rgba(0,229,160,0.2)', '0 0 40px rgba(0,229,160,0.4)', '0 0 20px rgba(0,229,160,0.2)'] }}
        transition={{ boxShadow: { duration: 4, repeat: Infinity } }}
      >
        <Sun size={24} className="text-solar-navy" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 glass z-50 flex flex-col"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-solar-indigo/20 flex items-center justify-center">
                  <Sun size={16} className="text-solar-indigo" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Solar AI Assistant</div>
                  <div className="text-xs text-solar-green">Online</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-solar-muted hover:text-solar-text transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Quick questions */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-border/30">
              {quickQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass text-solar-muted hover:text-solar-green hover:border-solar-green/30 transition-colors whitespace-nowrap"
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'glass text-solar-text'
                        : 'glass text-solar-text'
                    }`}
                    style={{
                      borderColor: msg.role === 'user' ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,160,0.2)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,160,0.2)'}`,
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator or streaming response */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-3 flex gap-1" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-solar-indigo"
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {displayedResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] glass rounded-2xl px-4 py-3 text-sm leading-relaxed" style={{ border: '1px solid rgba(0,229,160,0.2)' }}>
                    {displayedResponse}
                    <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} className="text-solar-green">|</motion.span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <button className="text-solar-muted hover:text-solar-green transition-colors p-2">
                  <Mic size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask about solar..."
                  className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none text-solar-text placeholder:text-solar-muted focus:ring-1 focus:ring-solar-green transition-all"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="p-2 text-solar-green hover:bg-solar-green/10 rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
