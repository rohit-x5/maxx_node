import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface TelemetryCardProps extends HTMLMotionProps<'div'> {
  title?: string;
  badge?: string;
  badgeVariant?: 'cyan' | 'papaya' | 'crimson' | 'emerald' | 'zinc';
  serialCode?: string;
  accentColor?: 'cyan' | 'papaya' | 'crimson' | 'emerald' | 'none';
  children: React.ReactNode;
  className?: string;
  isAlert?: boolean;
  cornerCut?: boolean;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  title,
  badge,
  badgeVariant = 'cyan',
  accentColor = 'none',
  children,
  className,
  isAlert = false,
  ...props
}) => {
  const badgeStyles = {
    cyan: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    papaya: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    crimson: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    zinc: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/40',
  };

  const accentGlow = {
    cyan: 'hover:border-sky-500/30 hover:shadow-[0_8px_30px_rgba(56,189,248,0.12)]',
    papaya: 'hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]',
    crimson: 'hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgba(244,63,94,0.16)]',
    emerald: 'hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
    none: 'hover:border-white/15 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]',
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
        transition: { type: 'spring', stiffness: 350, damping: 25 },
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative bg-zinc-900/45 backdrop-blur-xl border border-white/[0.07] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl transition-all duration-300',
        accentGlow[accentColor],
        isAlert && 'border-rose-500/40 bg-rose-950/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
        className
      )}
      {...props}
    >
      {/* Top Header Row if Title / Badges provided */}
      {(title || badge) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <h3 className="font-sans font-semibold text-xs tracking-wider uppercase text-zinc-300">
              {title}
            </h3>
          </div>

          {badge && (
            <span
              className={cn(
                'px-2.5 py-0.5 text-[11px] font-medium tracking-wide border rounded-full',
                badgeStyles[badgeVariant]
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
