import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { DashboardModule } from './dashboard/dashboard.module';
// import { RoomStatusModule } from './room-status/room-status.module';
import { PrismaModule } from '@prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    BookingsModule,
    RoomsModule,
    DashboardModule,
    // RoomStatusModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
