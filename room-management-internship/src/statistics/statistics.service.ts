import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
  format,
} from 'date-fns';

@Injectable()
export class VisitorStatisticsService {
  constructor(private prisma: PrismaService) {}

  private round(value: number, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  async getStatistics(timeRange: 'day' | 'month' | 'year', startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    // Clear semantics:
    if (timeRange === 'day') {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (timeRange === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      // 'year'
      start = startOfYear(now);
      end = endOfYear(now);
    }

    // override with custom range if provided
    if (startDate) start = startOfDay(new Date(startDate));
    if (endDate) end = endOfDay(new Date(endDate));

    // fetch visits whose checkedIn is inside the window
    const visits = await this.prisma.visit.findMany({
      where: { checkedIn: { gte: start, lte: end } },
      include: {
        visitor: true,
        booking: { include: { room: { include: { department: true } } } },
      },
    });

    // defensive filter by checkedIn
    const inRangeVisits = visits.filter(v => {
      const ci = new Date(v.checkedIn);
      return ci >= start && ci <= end;
    });

    const getDurationMin = (v: any) =>
      v.checkedOut ? (new Date(v.checkedOut).getTime() - new Date(v.checkedIn).getTime()) / 60000 : null;

    const dailyMap = new Map<string, { visitors: number; totalDuration: number; completed: number }>();
    const monthlyMap = new Map<string, { visitors: number; totalDuration: number; completed: number }>();
    const yearlyMap = new Map<string, { visitors: number; totalDuration: number; completed: number }>();
    const hourMap = new Map<string, number>();
    const departmentMap = new Map<string, number>();
    const roomMap = new Map<string, number>();
    const purposeMap = new Map<string, number>();

    let totalDurationSum = 0;
    let completedVisitsCount = 0;

    for (const v of inRangeVisits) {
      const checkedIn = new Date(v.checkedIn);
      const duration = getDurationMin(v);

      if (duration !== null) {
        totalDurationSum += duration;
        completedVisitsCount += 1;
      }

      // use format to avoid UTC shifts
      const dateKey = format(checkedIn, 'yyyy-MM-dd'); // local date bucket
      const monthKey = format(checkedIn, 'yyyy-MM');
      const yearKey = format(checkedIn, 'yyyy');

      const day = dailyMap.get(dateKey) ?? { visitors: 0, totalDuration: 0, completed: 0 };
      day.visitors += 1;
      if (duration !== null) { day.totalDuration += duration; day.completed += 1; }
      dailyMap.set(dateKey, day);

      const month = monthlyMap.get(monthKey) ?? { visitors: 0, totalDuration: 0, completed: 0 };
      month.visitors += 1;
      if (duration !== null) { month.totalDuration += duration; month.completed += 1; }
      monthlyMap.set(monthKey, month);

      const year = yearlyMap.get(yearKey) ?? { visitors: 0, totalDuration: 0, completed: 0 };
      year.visitors += 1;
      if (duration !== null) { year.totalDuration += duration; year.completed += 1; }
      yearlyMap.set(yearKey, year);

      const hourKey = String(checkedIn.getHours()).padStart(2, '0') + ':00';
      hourMap.set(hourKey, (hourMap.get(hourKey) || 0) + 1);

      const deptName = v.booking?.room?.department?.name || 'Unknown';
      departmentMap.set(deptName, (departmentMap.get(deptName) || 0) + 1);

      const roomName = v.booking?.room?.name || 'Unknown';
      roomMap.set(roomName, (roomMap.get(roomName) || 0) + 1);

      const purpose = v.purpose || v.booking?.purpose || 'Other';
      purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + 1);
    }

    // Build arrays (IMPORTANT: dailyMap.entries() to get the key date)
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, e]) => ({
        date,
        visitors: e.visitors,
        avgDuration: e.completed > 0 ? this.round(e.totalDuration / e.completed) : 0,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)); // latest first

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, e]) => ({
        month,
        visitors: e.visitors,
        avgDuration: e.completed > 0 ? this.round(e.totalDuration / e.completed) : 0,
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    const yearlyStats = Array.from(yearlyMap.entries())
      .map(([year, e]) => ({
        year,
        visitors: e.visitors,
        avgDuration: e.completed > 0 ? this.round(e.totalDuration / e.completed) : 0,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));

    const peakHours = Array.from(hourMap.entries())
      .map(([hour, visitors]) => ({ hour, visitors }))
      .sort((a, b) => b.visitors - a.visitors);

    const totalVisits = inRangeVisits.length;
    const departmentStats = Array.from(departmentMap.entries()).map(([department, visitors]) => ({
      department,
      visitors,
      percentage: totalVisits > 0 ? Math.round((visitors / totalVisits) * 100) : 0,
    }));
    const roomStats = Array.from(roomMap.entries()).map(([room, visitors]) => ({
      room,
      visitors,
      percentage: totalVisits > 0 ? Math.round((visitors / totalVisits) * 100) : 0,
    }));
    const purposeStats = Array.from(purposeMap.entries()).map(([purpose, visitors]) => ({
      purpose,
      visitors,
      percentage: totalVisits > 0 ? Math.round((visitors / totalVisits) * 100) : 0,
    }));

    const totalVisitors = totalVisits;
    const avgVisitDuration = completedVisitsCount > 0 ? this.round(totalDurationSum / completedVisitsCount) : 0;
    const numberOfDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
    const avgDailyVisitors = this.round(totalVisitors / numberOfDays);

    const peakHour = peakHours[0]?.hour || '';
    const mostVisitedDepartment = departmentStats.sort((a, b) => b.visitors - a.visitors)[0]?.department || '';
    const mostVisitedRoom = roomStats.sort((a, b) => b.visitors - a.visitors)[0]?.room || '';

    return {
      dailyStats,
      monthlyStats,
      yearlyStats,
      peakHours,
      departmentStats,
      roomStats,
      purposeStats,
      summary: { totalVisitors, avgVisitDuration, avgDailyVisitors, peakHour, mostVisitedDepartment, mostVisitedRoom },
    };
  }
}
