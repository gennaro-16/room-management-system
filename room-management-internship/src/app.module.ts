import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DepartmentsModule } from './departments/departments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VisitorsModule } from './visitors/visitors.module';
import { VisitModule } from './visits/visits.module';
import { StatisticsModule } from './statistics/statistics.module';
@Module({
  imports: [
    PrismaModule,
    BookingsModule,
    RoomsModule,
    DashboardModule,
    DepartmentsModule,
    NotificationsModule,
    ApprovalsModule,
    AuthModule,
    UsersModule,
    VisitModule,
    VisitorsModule,
    StatisticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
