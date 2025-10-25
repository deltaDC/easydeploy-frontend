"use client";

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className = "" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // Hiển thị xuống dưới button
        left: rect.left + rect.width / 2
      });
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap transform -translate-x-1/2 pointer-events-none"
          style={{
            top: position.top,
            left: position.left
          }}
        >
          {content}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </>
  );
}
