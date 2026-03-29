import { useState, useEffect } from 'react';
import { Star, MessageCircle, Quote } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';

export default function ReviewsManagement() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('sunwise_orders') || '[]');
    setOrders(data);
  }, []);

  const reviews = orders.filter(o => o.rated);

  return (
    <div className="min-h-screen py-24 px-4 lg:px-16 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gradient-secondary flex items-center gap-3">
          <Star className="text-secondary" /> Client Feedback
        </h1>
        <p className="text-muted-foreground mt-1 text-sm uppercase tracking-widest font-bold opacity-70">Ratings & Professional Reviews</p>
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl">
          <Quote className="w-12 h-12 text-white/5 mx-auto mb-4" />
          <p className="text-muted-foreground">No customer reviews yet. Ratings appear here after delievery.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((o, i) => (
          <GlassCard key={o.id} delay={i * 0.05} className="relative overflow-hidden group">
            <Quote className="absolute -right-4 -top-4 w-24 h-24 text-white/[0.02] group-hover:text-primary/5 transition-colors" />
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={cn('w-4 h-4', o.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-white/10')} />
              ))}
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{o.id}</span>
            </div>
            <p className="text-foreground/90 italic text-sm leading-relaxed mb-4">"{o.reviewText}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Client Review</div>
              <div className="text-[10px] font-mono opacity-40">{new Date(o.date).toLocaleDateString()}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
