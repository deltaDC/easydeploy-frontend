"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useCallback, useReducer } from "react";
import { DatabaseType } from "@/types/database.type";
import { CREATION_STEPS, DB_TYPE_COLORS } from "./types";
import { DatabaseTypeIcon } from "./DatabaseTypeIcon";

interface CreationJourneyModalProps {
  isOpen: boolean;
  dbType: DatabaseType;
  dbName: string;
  onComplete: () => void;
}

// Use reducer to manage state changes
type State = { currentStep: number; isComplete: boolean };
type Action = 
  | { type: "SET_STEP"; step: number }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "COMPLETE":
      return { ...state, isComplete: true };
    case "RESET":
      return { currentStep: 0, isComplete: false };
    default:
      return state;
  }
}

export function CreationJourneyModal({
  isOpen,
  dbType,
  dbName,
  onComplete,
}: CreationJourneyModalProps) {
  const [state, dispatch] = useReducer(reducer, { currentStep: 0, isComplete: false });
  const { currentStep, isComplete } = state;
  const colors = DB_TYPE_COLORS[dbType];
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const wasOpenRef = useRef(isOpen);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // Start animation sequence
  const startSequence = useCallback(() => {
    clearAllTimeouts();
    dispatch({ type: "RESET" });
    
    let totalDelay = 100; // Small delay to allow reset to process

    CREATION_STEPS.forEach((step, index) => {
      const timeout = setTimeout(() => {
        dispatch({ type: "SET_STEP", step: index });

        if (index === CREATION_STEPS.length - 1) {
          const completeTimeout = setTimeout(() => {
            dispatch({ type: "COMPLETE" });
            const redirectTimeout = setTimeout(onComplete, 800);
            timeoutsRef.current.push(redirectTimeout);
          }, step.duration);
          timeoutsRef.current.push(completeTimeout);
        }
      }, totalDelay);
      timeoutsRef.current.push(timeout);
      totalDelay += step.duration;
    });
  }, [clearAllTimeouts, onComplete]);

  // Handle modal open/close
  useEffect(() => {
    // Modal just opened
    if (isOpen && !wasOpenRef.current) {
      startSequence();
    }

    // Modal just closed - reset state via timeout
    if (!isOpen && wasOpenRef.current) {
      clearAllTimeouts();
      const resetTimeout = setTimeout(() => {
        dispatch({ type: "RESET" });
      }, 0);
      timeoutsRef.current.push(resetTimeout);
    }

    wasOpenRef.current = isOpen;

    return () => {
      clearAllTimeouts();
    };
  }, [isOpen, startSequence, clearAllTimeouts]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(30, 41, 59, 0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md p-8 rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px ${colors.glow}`,
            }}
          >
            {/* Pearl flash on complete */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Mist background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -15, 0],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Animated seed/icon */}
              <div className="relative h-32 mb-6 flex items-center justify-center">
                <motion.div
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: isComplete ? 1.1 : 1,
                  }}
                  transition={{
                    y: { duration: 0.8, ease: "easeOut" },
                    opacity: { duration: 0.5 },
                    scale: isComplete
                      ? { duration: 0.3 }
                      : {},
                  }}
                >
                  <DatabaseTypeIcon type={dbType} size="xl" animated={false} showGlow />
                </motion.div>

                {/* Growing effect from seed */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentStep > 0 ? 1 : 0 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 80 + i * 40,
                        height: 80 + i * 40,
                        border: `1px solid ${colors.border}`,
                      }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: [0.5, 1.2],
                        opacity: [0.6, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Database name */}
              <motion.h3
                className="text-xl font-semibold text-charcoal mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {dbName}
              </motion.h3>

              {/* Status message with typewriter effect */}
              <div className="h-6 mb-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-charcoal/60"
                  >
                    {CREATION_STEPS[currentStep]?.message || ""}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {CREATION_STEPS.map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        index <= currentStep ? colors.primary : "rgba(0,0,0,0.1)",
                    }}
                    animate={
                      index === currentStep
                        ? {
                            scale: [1, 1.3, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.5,
                      repeat: index === currentStep ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CreationJourneyModal;
