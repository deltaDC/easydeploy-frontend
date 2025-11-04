import { format, formatDistanceToNow, getWeek, endOfMonth } from "date-fns";

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return "N/A";
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

export function formatDate(
  dateString: string | null | undefined,
  formatStr: string = "dd/MM/yyyy HH:mm"
): string {
  if (!dateString) return "N/A";
  
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return "N/A";
  }
}

export function getEffectiveDate(deployment: {
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}): string {
  return deployment.startedAt || deployment.completedAt || deployment.createdAt;
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  
  try {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
    });
  } catch {
    return "N/A";
  }
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  return value.toLocaleString("vi-VN");
}

export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(decimals)}%`;
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatPercentageChange(change: number, decimals: number = 1): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(decimals)}%`;
}

export function getTrendIndicator(change: number, isPositiveGood: boolean = true): {
  direction: "up" | "down" | "stable";
  color: string;
  icon: "↑" | "↓" | "→";
} {
  const threshold = 0.1;
  
  if (Math.abs(change) < threshold) {
    return { direction: "stable", color: "text-slate-500", icon: "→" };
  }
  
  const isPositive = change > 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;
  
  if (isGood) {
    return { direction: "up", color: "text-green-600 dark:text-green-400", icon: "↑" };
  } else {
    return { direction: "down", color: "text-red-600 dark:text-red-400", icon: "↓" };
  }
}

export function calculateTrendTotal(dataPoints: Array<{ value: number }> | null | undefined): number {
  if (!dataPoints || dataPoints.length === 0) return 0;
  return dataPoints.reduce((sum, point) => sum + (point.value || 0), 0);
}

export function getPeriodLabels(timeRange: string): {
  current: string;
  previous: string;
} {
  const labels: Record<string, { current: string; previous: string }> = {
    day: { current: "Hôm nay", previous: "Hôm qua" },
    week: { current: "Tuần này", previous: "Tuần trước" },
    month: { current: "Tháng này", previous: "Tháng trước" },
    year: { current: "Năm này", previous: "Năm trước" },
  };
  
  return labels[timeRange] || { current: "Kỳ này", previous: "Kỳ trước" };
}

export function getStatusBadgeClasses(status: string): string {
  const statusMap: Record<string, string> = {
    SUCCESS: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 hover:text-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-300 transition-colors",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 hover:text-red-800 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-colors",
    PENDING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 hover:text-orange-800 dark:hover:bg-orange-900/50 dark:hover:text-orange-300 transition-colors",
    IN_PROGRESS: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 hover:text-purple-800 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 transition-colors",
  };
  
  return statusMap[status] || "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-900/50 dark:hover:text-slate-300 transition-colors";
}

export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    PENDING: "Đang chờ",
    IN_PROGRESS: "Đang xử lý",
  };
  
  return labelMap[status] || status;
}

export function getSuccessRateQuality(successRate: number): {
  label: string;
  color: string;
} {
  if (successRate >= 90) {
    return {
      label: "Tốt",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  }
  if (successRate >= 70) {
    return {
      label: "Trung bình",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  }
  return {
    label: "Cần cải thiện",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
}


export function getWeekNumber(date: Date = new Date()): number {
  return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
}

export function getWeekDateRange(weekNumber: number, year: number): { start: Date; end: Date } {
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - jan4Day + 1 + (weekNumber - 1) * 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { start: weekStart, end: weekEnd };
}

export function getAllWeeksInYear(year: number = new Date().getFullYear()): Array<{ weekNumber: number; start: Date; end: Date }> {
  const currentWeek = getWeekNumber(new Date());
  const weeks: Array<{ weekNumber: number; start: Date; end: Date }> = [];
  
  for (let week = currentWeek; week >= 1; week--) {
    const range = getWeekDateRange(week, year);
    weeks.push({ weekNumber: week, start: range.start, end: range.end });
  }
  
  return weeks;
}

export function getAllMonthsInYear(year: number = new Date().getFullYear()): Array<{ monthNumber: number; start: Date; end: Date }> {
  const currentMonth = new Date().getMonth() + 1;
  const months: Array<{ monthNumber: number; start: Date; end: Date }> = [];
  
  for (let month = currentMonth; month >= 1; month--) {
    const start = new Date(year, month - 1, 1);
    const end = endOfMonth(start);
    months.push({ monthNumber: month, start, end });
  }
  
  return months;
}

export function getAllYears(startYear: number = 2020): Array<number> {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  
  return years;
}

export function formatWeekLabel(weekNumber: number, year: number = new Date().getFullYear()): string {
  const range = getWeekDateRange(weekNumber, year);
  return `Tuần ${weekNumber} (${format(range.start, "dd/MM/yyyy")} - ${format(range.end, "dd/MM/yyyy")})`;
}

export function formatMonthLabel(monthNumber: number, year: number = new Date().getFullYear()): string {
  return `Tháng ${monthNumber}/${year}`;
}

export function formatYearLabel(year: number): string {
  return `${year}`;
}

