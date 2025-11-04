import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

export function useStatsTimeRange(
  onTimeRangeChange?: (timeRange: string, startDate?: string, endDate?: string) => void
) {
  // Initialize with current month as default
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const defaultStart = new Date(currentYear, currentMonth - 1, 1);
  const defaultEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  
  const [timeRange, setTimeRange] = useState<string>("month");
  const [customStartDate, setCustomStartDate] = useState<string>(format(defaultStart, "yyyy-MM-dd"));
  const [customEndDate, setCustomEndDate] = useState<string>(format(defaultEnd, "yyyy-MM-dd"));
  const [lastSelectedMonth, setLastSelectedMonth] = useState<number>(currentMonth);
  const [lastSelectedYear, setLastSelectedYear] = useState<number>(currentYear);

  const handleMonthChange = useCallback((monthNumber: number, year: number) => {
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 0, 23, 59, 59, 999);
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");
    setCustomStartDate(startStr);
    setCustomEndDate(endStr);
    setLastSelectedMonth(monthNumber);
    setLastSelectedYear(year);
    setTimeRange("month");
    if (onTimeRangeChange) {
      onTimeRangeChange("month", startStr, endStr);
    }
  }, [onTimeRangeChange]);

  const handleYearChange = useCallback((year: number) => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");
    setCustomStartDate(startStr);
    setCustomEndDate(endStr);
    setLastSelectedYear(year);
    setTimeRange("year");
    if (onTimeRangeChange) {
      onTimeRangeChange("year", startStr, endStr);
    }
  }, [onTimeRangeChange]);

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
    
    if (value === "month" && lastSelectedMonth && lastSelectedYear) {
      const start = new Date(lastSelectedYear, lastSelectedMonth - 1, 1);
      const end = new Date(lastSelectedYear, lastSelectedMonth, 0, 23, 59, 59, 999);
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");
      setCustomStartDate(startStr);
      setCustomEndDate(endStr);
      if (onTimeRangeChange) {
        onTimeRangeChange(value, startStr, endStr);
      }
    } else if (value === "year" && lastSelectedYear) {
      const start = new Date(lastSelectedYear, 0, 1);
      const end = new Date(lastSelectedYear, 11, 31, 23, 59, 59, 999);
      const startStr = format(start, "yyyy-MM-dd");
      const endStr = format(end, "yyyy-MM-dd");
      setCustomStartDate(startStr);
      setCustomEndDate(endStr);
      if (onTimeRangeChange) {
        onTimeRangeChange(value, startStr, endStr);
      }
    } else {
      setCustomStartDate("");
      setCustomEndDate("");
      if (onTimeRangeChange) {
        onTimeRangeChange(value);
      }
    }
  }, [onTimeRangeChange, lastSelectedMonth, lastSelectedYear]);

  return {
    timeRange,
    customStartDate,
    customEndDate,
    setTimeRange: handleTimeRangeChange,
    handleMonthChange,
    handleYearChange,
  };
}

