/**
 * Animation utilities và hooks cho reusable animations
 * Sử dụng CSS animations và Intersection Observer cho scroll-triggered animations
 */

import React from "react";

export type AnimationVariant = 
  | 'fadeIn'
  | 'slideUp'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'float';

export interface AnimationConfig {
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

interface ScrollAnimationOptions extends IntersectionObserverInit {
  once?: boolean;
}

/**
 * Animation class names mapping
 */
export const animationClasses: Record<AnimationVariant, string> = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  scaleIn: 'animate-scale-in',
  float: 'animate-float',
};

/**
 * Stagger delay cho list items
 */
export const getStaggerDelay = (index: number, baseDelay: number = 100): number => {
  return index * baseDelay;
};

/**
 * Animation variants với timing
 */
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * Hook để tạo scroll-triggered animation
 * Sử dụng Intersection Observer API
 */
export const useScrollAnimation = (
  variant: AnimationVariant = 'fadeIn',
  options: ScrollAnimationOptions = {}
) => {
  // Hooks must be called unconditionally
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    // Early return if window is undefined (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const element = ref.current;
    if (!element) return;

    const { once = true, threshold, rootMargin, ...observerOptions } = options;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: threshold || 0.1,
        rootMargin: rootMargin || '0px',
        ...observerOptions,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin, options.once]);

  // Return appropriate values based on environment
  if (typeof window === 'undefined') {
    return { ref: null, isVisible: false, className: 'opacity-0' };
  }

  return {
    ref,
    isVisible,
    className: isVisible ? animationClasses[variant] : 'opacity-0',
  };
};
