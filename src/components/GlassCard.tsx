import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'primary' | 'amber' | 'indigo' | 'none';
  delay?: number;
}

export default function GlassCard({ children, className = '', hover = true, glow = 'none', delay = 0 }: GlassCardProps) {
  const glowClass = glow === 'primary' ? 'glow-primary' : glow === 'amber' ? 'glow-amber' : glow === 'indigo' ? 'glow-indigo' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass noise-overlay relative rounded-xl p-6 ${hover ? 'glass-hover' : ''} ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
