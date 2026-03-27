import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Mic, Sun } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

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

export default function AIChatPage() {
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
    <section className="min-h-[calc(100vh-80px)] py-6 px-6 lg:pl-24 flex flex-col items-center">
      <div className="w-full max-w-4xl flex-1 flex flex-col h-full bg-card border border-border/50 rounded-2xl overflow-hidden glass shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border/30 bg-background/50 backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,229,160,0.2)]">
            <Sun size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Solar AI Assistant</h2>
            <div className="flex items-center gap-2 text-xs text-primary font-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Always Ready to Output
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="px-6 py-4 flex gap-3 overflow-x-auto border-b border-border/30 bg-background/30 hide-scrollbar">
          {quickQuestions.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-xs px-4 py-2 rounded-full border border-border/50 bg-background/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all font-medium shadow-sm"
            >
              {q}
            </motion.button>
          ))}
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                  {msg.role === 'user' ? <MessageCircle size={14} className="text-secondary" /> : <Sun size={14} className="text-primary" />}
                </div>
                <div
                  className={`px-5 py-4 text-[15px] leading-relaxed rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-secondary/10 text-foreground border border-secondary/20'
                      : 'bg-background/50 text-foreground border border-primary/20 shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/20 flex items-center justify-center">
                  <Sun size={14} className="text-primary" />
                </div>
                <div className="px-5 py-4 border border-primary/20 bg-background/50 rounded-2xl flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {displayedResponse && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/20 flex items-center justify-center">
                  <Sun size={14} className="text-primary" />
                </div>
                <div className="px-5 py-4 text-[15px] leading-relaxed border border-primary/20 bg-background/50 rounded-2xl">
                  {displayedResponse}
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }} className="text-primary ml-1">|</motion.span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border/30 bg-background/50">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type your solar query here..."
              className="w-full bg-background border border-border/50 rounded-2xl pl-12 pr-12 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 shadow-sm transition-all"
            />
            <Mic size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
