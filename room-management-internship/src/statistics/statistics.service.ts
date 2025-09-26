import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class VisitorStatisticsService {
  constructor(private prisma: PrismaService) {}

  // Main method to fetch all statistics
  async getStatistics(timeRange: 'day' | 'month' | 'year', startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date = new Date();

    if (timeRange === 'day') start = subDays(end, 7);
    else if (timeRange === 'month') start = subMonths(end, 6);
    else start = subYears(end, 5);

    // Override with custom range if provided
    if (startDate) start = startOfDay(new Date(startDate));
    if (endDate) end = endOfDay(new Date(endDate));

    // 1️⃣ Fetch visits in the range
    const visits = await this.prisma.visit.findMany({
      where: { checkedIn: { gte: start, lte: end } },
      include: {
        visitor: true,
        booking: {
          include: {
            room: { include: { department: true } },
          },
        },
      },
    });

    // 2️⃣ Compute daily/monthly/yearly stats
    const dailyStats = visits.reduce((acc, v) => {
      const date = v.checkedIn.toISOString().split('T')[0];
      const duration = v.checkedOut ? (v.checkedOut.getTime() - v.checkedIn.getTime()) / 60000 : 0;
      const entry = acc.find(e => e.date === date);
      if (entry) {
        entry.visitors += 1;
        entry.avgDuration = (entry.avgDuration + duration) / 2;
      } else acc.push({ date, visitors: 1, avgDuration: duration });
      return acc;
    }, [] as Array<{ date: string; visitors: number; avgDuration: number }>);

    // Monthly and yearly aggregation
    const monthlyStats = visits.reduce((acc, v) => {
      const month = v.checkedIn.toISOString().slice(0, 7); // YYYY-MM
      const duration = v.checkedOut ? (v.checkedOut.getTime() - v.checkedIn.getTime()) / 60000 : 0;
      const entry = acc.find(e => e.month === month);
      if (entry) {
        entry.visitors += 1;
        entry.avgDuration = (entry.avgDuration + duration) / 2;
      } else acc.push({ month, visitors: 1, avgDuration: duration });
      return acc;
    }, [] as Array<{ month: string; visitors: number; avgDuration: number }>);

    const yearlyStats = visits.reduce((acc, v) => {
      const year = v.checkedIn.getFullYear().toString();
      const duration = v.checkedOut ? (v.checkedOut.getTime() - v.checkedIn.getTime()) / 60000 : 0;
      const entry = acc.find(e => e.year === year);
      if (entry) {
        entry.visitors += 1;
        entry.avgDuration = (entry.avgDuration + duration) / 2;
      } else acc.push({ year, visitors: 1, avgDuration: duration });
      return acc;
    }, [] as Array<{ year: string; visitors: number; avgDuration: number }>);

    // 3️⃣ Peak hours
    const peakHours = visits.reduce((acc, v) => {
      const hour = `${v.checkedIn.getHours()}:00`;
      const entry = acc.find(e => e.hour === hour);
      if (entry) entry.visitors += 1;
      else acc.push({ hour, visitors: 1 });
      return acc;
    }, [] as Array<{ hour: string; visitors: number }>);

    // 4️⃣ Department stats
    const departmentMap = new Map<string, number>();
    visits.forEach(v => {
      const deptName = v.booking?.room?.department?.name || 'Unknown';
      departmentMap.set(deptName, (departmentMap.get(deptName) || 0) + 1);
    });
    const departmentStats = Array.from(departmentMap.entries()).map(([department, visitors]) => ({
      department,
      visitors,
      percentage: Math.round((visitors / visits.length) * 100),
    }));

    // 5️⃣ Room stats
    const roomMap = new Map<string, number>();
    visits.forEach(v => {
      const roomName = v.booking?.room?.name || 'Unknown';
      roomMap.set(roomName, (roomMap.get(roomName) || 0) + 1);
    });
    const roomStats = Array.from(roomMap.entries()).map(([room, visitors]) => ({
      room,
      visitors,
      percentage: Math.round((visitors / visits.length) * 100),
    }));

    // 6️⃣ Purpose stats
    const purposeMap = new Map<string, number>();
    visits.forEach(v => {
      const purpose = v.purpose || v.booking?.purpose || 'Other';
      purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + 1);
    });
    const purposeStats = Array.from(purposeMap.entries()).map(([purpose, visitors]) => ({
      purpose,
      visitors,
      percentage: Math.round((visitors / visits.length) * 100),
    }));

    // 7️⃣ Summary
    const totalVisitors = visits.length;
    const avgVisitDuration =
      visits.reduce(
        (sum, v) => sum + (v.checkedOut ? (v.checkedOut.getTime() - v.checkedIn.getTime()) / 60000 : 0),
        0,
      ) / totalVisitors || 0;
    const avgDailyVisitors = totalVisitors / ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const peakHour = peakHours.sort((a, b) => b.visitors - a.visitors)[0]?.hour || '';
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
