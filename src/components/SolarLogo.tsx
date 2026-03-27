import { motion } from 'framer-motion';

export default function SolarLogo({ size = 48 }: { size?: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      {/* Sun circle */}
      <motion.circle
        cx="24" cy="24" r="10"
        fill="#00E5A0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      />
      {/* Rays with circuit style */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + Math.cos(rad) * 14;
        const y1 = 24 + Math.sin(rad) * 14;
        const x2 = 24 + Math.cos(rad) * 20;
        const y2 = 24 + Math.sin(rad) * 20;
        return (
          <motion.line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#00E5A0"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
          />
        );
      })}
      {/* Circuit dots at ray ends */}
      {[0, 90, 180, 270].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 24 + Math.cos(rad) * 20;
        const cy = 24 + Math.sin(rad) * 20;
        return (
          <motion.circle
            key={`dot-${angle}`}
            cx={cx} cy={cy} r="2"
            fill="#00E5A0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          />
        );
      })}
    </motion.svg>
  );
}
