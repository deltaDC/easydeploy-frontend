/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'misty-sage': '#92AFAD',
        'pearl-white': '#EAEAEA',
        'charcoal': '#1E293B',
        'charcoal-light': '#334155',
        'soft-blue': '#B9C9D6',
        'misty-grey': '#E8E8E8',
        'porcelain': '#FFFFFF',
        'rose-soft': '#FCA5A5',
        'rose-light': '#FECACA',
        'emerald': {
          '50': '#ECFDF5',
          '100': '#D1FAE5',
          '200': '#A7F3D0',
          '300': '#6EE7B7',
          '400': '#34D399',
          '500': '#10B981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065F46',
          '900': '#064E3B',
        },
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'misty': '32px',
        'misty-sm': '12px',
        'misty-md': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-blur': 'fadeBlur 0.6s ease-out',
        'misty-float': 'mistyFloat 8s ease-in-out infinite',
        'number-count': 'numberCount 2s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple 0.6s ease-out',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeBlur: {
          '0%': { opacity: '0', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0px)' },
        },
        mistyFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(10px) translateX(-10px)' },
        },
        numberCount: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '800': '800ms',
      },
      boxShadow: {
        'misty-sm': '0 2px 8px -2px rgba(146, 175, 173, 0.12)',
        'misty': '0 4px 16px -4px rgba(146, 175, 173, 0.15)',
        'misty-md': '0 8px 24px -6px rgba(146, 175, 173, 0.18)',
        'misty-lg': '0 10px 30px -10px rgba(146, 175, 173, 0.15)',
        'misty-xl': '0 20px 40px -12px rgba(146, 175, 173, 0.2)',
        'inner-glow': 'inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
        'inner-glow-soft': 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
        'misty-sage-sm': '0 4px 6px -1px rgba(146, 175, 173, 0.1), 0 2px 4px -2px rgba(146, 175, 173, 0.06)',
        'misty-sage-md': '0 10px 15px -3px rgba(146, 175, 173, 0.15), 0 4px 6px -4px rgba(146, 175, 173, 0.1)',
        'misty-sage-lg': '0 20px 25px -5px rgba(146, 175, 173, 0.2), 0 8px 10px -6px rgba(146, 175, 173, 0.15)',
        'misty-sage-xl': '0 25px 50px -12px rgba(146, 175, 173, 0.25)',
        'emerald-md': '0 10px 15px -3px rgba(5, 150, 105, 0.15), 0 4px 6px -4px rgba(5, 150, 105, 0.1)',
        'rose-sm': '0 4px 6px -1px rgba(255, 192, 203, 0.1), 0 2px 4px -2px rgba(255, 192, 203, 0.06)',
      },
    },
  },
  plugins: [],
}
