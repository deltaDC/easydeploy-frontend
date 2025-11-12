"use client";

import { useState, useMemo, useLayoutEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem as BaseSelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check } from "lucide-react";
import { cn } from "@/components/lib/utils";
import { 
  getAllMonthsInYear, 
  getAllYears,
  formatMonthLabel,
  formatYearLabel
} from "@/utils/stats.utils";

interface StatsTimeRangeFilterProps {
  value: string;
  onChange: (value: string) => void;
  onMonthChange?: (monthNumber: number, year: number) => void;
  onYearChange?: (year: number) => void;
  className?: string;
  startDate?: string;
  endDate?: string;
}

const timeRangeTypes = [
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
] as const;

export function StatsTimeRangeFilter({
  value,
  onChange,
  onMonthChange,
  onYearChange,
  className,
  startDate,
  endDate,
}: StatsTimeRangeFilterProps) {
  const getInitialMonth = () => {
    if (startDate) {
      return new Date(startDate).getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  };

  const getInitialYear = () => {
    if (startDate) {
      return new Date(startDate).getFullYear();
    }
    return new Date().getFullYear();
  };

  const [selectedMonth, setSelectedMonth] = useState<number>(getInitialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(getInitialYear);
  
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      if (value === "month") {
        setSelectedMonth(date.getMonth() + 1);
        setSelectedYear(date.getFullYear());
      } else if (value === "year") {
        setSelectedYear(date.getFullYear());
      }
    }
  }, [startDate, value]);
  /* eslint-enable react-hooks/set-state-in-effect */
  
  const monthOptions = useMemo(() => getAllMonthsInYear(selectedYear), [selectedYear]);
  const yearOptions = useMemo(() => getAllYears(2020), []);
  
  const CustomSelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
  >(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1 pl-3 pr-3 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ));
  CustomSelectItem.displayName = "CustomSelectItem";
  
  const getCurrentValue = () => {
    if (value === "month") {
      return selectedMonth.toString();
    }
    if (value === "year") {
      return selectedYear.toString();
    }
    return "";
  };

  const getDisplayLabel = () => {
    if (value === "month") {
      return formatMonthLabel(selectedMonth, selectedYear);
    }
    if (value === "year") {
      return formatYearLabel(selectedYear);
    }
    return "Chọn khoảng thời gian";
  };

  const handleValueChange = (newValue: string) => {
    if (value === "month") {
      const monthNum = parseInt(newValue);
      setSelectedMonth(monthNum);
      if (onMonthChange) {
        onMonthChange(monthNum, selectedYear);
      }
    } else if (value === "year") {
      const yearNum = parseInt(newValue);
      setSelectedYear(yearNum);
      if (onYearChange) {
        onYearChange(yearNum);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)} role="group" aria-label="Chọn khoảng thời gian">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Khoảng thời gian:</span>
      
      {/* Type selector (buttons) */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1" role="radiogroup">
        {timeRangeTypes.map((type) => (
          <Button
            key={type.value}
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(type.value);
              if (type.value === "month" && value !== "month") {
              } else if (type.value === "year" && value !== "year") {
              }
            }}
            className={cn(
              "text-xs px-4 py-1.5 h-8 font-medium transition-colors",
              value === type.value
                ? "bg-sky-500 text-white hover:bg-sky-600 hover:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
            aria-pressed={value === type.value}
            role="radio"
            aria-label={type.label}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Value selector (dropdown) */}
      <Select
        value={getCurrentValue()}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          className={cn(
            "h-8 text-sm border-slate-200 dark:border-slate-700",
            "bg-white dark:bg-slate-800",
            "hover:border-sky-400 dark:hover:border-sky-600",
            "focus:border-sky-500 dark:focus:border-sky-500",
            value === "month" ? "w-[160px]" : "w-[120px]"
          )}
        >
          <SelectValue placeholder="Chọn giá trị">
            {getDisplayLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className={cn(
            "max-h-[180px]",
            value === "month" ? "w-[160px]" : "w-[120px]"
          )}
        >
          {value === "month" && monthOptions.map((month) => {
            const isSelected = selectedMonth === month.monthNumber;
            return (
              <CustomSelectItem 
                key={month.monthNumber} 
                value={month.monthNumber.toString()}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{formatMonthLabel(month.monthNumber, selectedYear)}</span>
                  {isSelected && <Check className="h-4 w-4 text-sky-500 ml-2 flex-shrink-0" />}
                </div>
              </CustomSelectItem>
            );
          })}
          {value === "year" && yearOptions.map((year) => {
            const isSelected = selectedYear === year;
            return (
              <CustomSelectItem 
                key={year} 
                value={year.toString()}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{formatYearLabel(year)}</span>
                  {isSelected && <Check className="h-4 w-4 text-sky-500 ml-2 flex-shrink-0" />}
                </div>
              </CustomSelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
