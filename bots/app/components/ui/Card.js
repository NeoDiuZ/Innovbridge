import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'p-6',
  animate = false,
  ...props
}) {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      className={`bg-white rounded-xl shadow-subtle ${padding} ${className}`}
      {...animationProps}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-medium text-lg text-secondary-900">{title}</h3>}
          {subtitle && <p className="text-secondary-500 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </Component>
  );
} 