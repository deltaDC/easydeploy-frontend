"use client";

import * as React from "react";

interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  className?: string;
}

const RadioGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, className }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  
  if (!context) {
    throw new Error("RadioGroupItem must be used within RadioGroup");
  }

  const isChecked = context.value === value;

  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={isChecked}
      onChange={() => context.onValueChange(value)}
      className={`h-4 w-4 cursor-pointer ${className || ''}`}
    />
  );
}
