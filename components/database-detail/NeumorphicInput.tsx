"use client";

import { motion } from "framer-motion";
import { InputHTMLAttributes, forwardRef, useState } from "react";

interface NeumorphicInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NeumorphicInput = forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ label, error, className = "", onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-charcoal block">
            {label}
          </label>
        )}
        <motion.div
          className="relative"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl transition-all duration-300 ${className}`}
            style={{
              background: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              border: "none",
              boxShadow: isFocused
                ? (error
                    ? "inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.3), 0 0 0 2px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.2)"
                    : "inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.3), 0 0 0 2px rgba(146, 175, 173, 0.3), 0 0 20px rgba(146, 175, 173, 0.2)")
                : (error
                    ? "inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.3), 0 0 0 2px rgba(239, 68, 68, 0.3)"
                    : "inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.3)"),
              color: "#334155",
              textShadow: isFocused ? "0 0 10px rgba(51, 65, 85, 0.4)" : "0 0 10px rgba(51, 65, 85, 0.3)",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

NeumorphicInput.displayName = "NeumorphicInput";

export default NeumorphicInput;

