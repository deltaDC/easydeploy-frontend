"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnergySliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  valueLabel?: string;
  className?: string;
}

const EnergySlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  EnergySliderProps
>(({ className, label, valueLabel, ...props }, ref) => {
  const [value, setValue] = React.useState(props.value || props.defaultValue || [0]);
  const currentValue = Array.isArray(value) ? value[0] : value;
  const max = props.max || 100;
  const min = props.min || 0;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  // Motion value for smooth light stream animation
  const lightPosition = useMotionValue(0);
  const lightOpacity = useTransform(lightPosition, [0, 100], [0.3, 1]);

  React.useEffect(() => {
    lightPosition.set(percentage);
  }, [percentage, lightPosition]);

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-charcoal">{label}</label>
          {valueLabel && (
            <span className="text-sm font-semibold text-charcoal">{valueLabel}</span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          if (props.onValueChange) {
            props.onValueChange(newValue);
          }
        }}
        {...props}
      >
        <SliderPrimitive.Track 
          className="relative h-3 w-full grow overflow-hidden rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Energy fill */}
          <SliderPrimitive.Range 
            className="absolute h-full rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(90deg, 
                rgba(16, 185, 129, 0.8) 0%, 
                rgba(16, 185, 129, 1) 50%, 
                rgba(16, 185, 129, 0.8) 100%)`,
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
            }}
          >
            {/* Light stream that follows the value */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                width: "30%",
                x: useTransform(lightPosition, (v) => `${v}%`),
                opacity: lightOpacity,
                filter: "blur(2px)",
              }}
              animate={{
                x: [`${percentage}%`, `${percentage}%`],
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            />
            
            {/* Glowing particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
                style={{
                  left: `${percentage}%`,
                  boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                }}
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </SliderPrimitive.Range>
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb 
          className="block h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 cursor-grab active:cursor-grabbing relative z-10"
          style={{
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.6), 0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Glow effect on thumb */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent)",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.8)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
});

EnergySlider.displayName = SliderPrimitive.Root.displayName;

export { EnergySlider };

