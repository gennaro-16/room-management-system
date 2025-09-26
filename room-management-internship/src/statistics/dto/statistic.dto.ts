// src/statistics/dto/statistic.dto.ts
export interface DailyStat {
  date: string;
  visitors: number;
  avgDuration: number;
}

export interface MonthlyStat {
  month: string;
  visitors: number;
  avgDuration: number;
}

export interface YearlyStat {
  year: number;
  visitors: number;
  avgDuration: number;
}

export interface PeakHourStat {
  hour: number;
  visitors: number;
}

export interface DepartmentStat {
  department: string;
  visitors: number;
  percentage: number;
}

export interface RoomStat {
  room: string;
  visitors: number;
  percentage: number;
}

export interface PurposeStat {
  purpose: string;
  visitors: number;
  percentage: number;
}

export interface SummaryStat {
  totalVisitors: number;
  avgVisitDuration: number;
  avgDailyVisitors: number;
  peakHour: number | null;
  mostVisitedDepartment: string | null;
  mostVisitedRoom: string | null;
}

export interface StatsDataDto {
  dailyStats: DailyStat[];
  monthlyStats: MonthlyStat[];
  yearlyStats: YearlyStat[];
  peakHours: PeakHourStat[];
  departmentStats: DepartmentStat[];
  roomStats: RoomStat[];
  purposeStats: PurposeStat[];
  summary: SummaryStat;
}
