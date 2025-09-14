import { PrismaClient, UserRole, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@company.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        department: 'IT',
      }
    }),
    prisma.user.upsert({
      where: { email: 'manager@company.com' },
      update: {},
      create: {
        username: 'manager',
        email: 'manager@company.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'Manager',
        lastName: 'User',
        department: 'Management',
      }
    }),
    prisma.user.upsert({
      where: { email: 'john@company.com' },
      update: {},
      create: {
        username: 'john.smith',
        email: 'john@company.com',
        password: hashedPassword,
        role: UserRole.USER,
        firstName: 'John',
        lastName: 'Smith',
        department: 'Engineering',
      }
    }),
    prisma.user.upsert({
      where: { email: 'sarah@company.com' },
      update: {},
      create: {
        username: 'sarah.johnson',
        email: 'sarah@company.com',
        password: hashedPassword,
        role: UserRole.USER,
        firstName: 'Sarah',
        lastName: 'Johnson',
        department: 'Marketing',
      }
    }),
    prisma.user.upsert({
      where: { email: 'michael@company.com' },
      update: {},
      create: {
        username: 'michael.brown',
        email: 'michael@company.com',
        password: hashedPassword,
        role: UserRole.USER,
        firstName: 'Michael',
        lastName: 'Brown',
        department: 'Sales',
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { name: 'Conference Room A' },
      update: {},
      create: {
        name: 'Conference Room A',
        capacity: 10,
        description: 'Large conference room with projector and whiteboard',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        isUnderMaintenance: false
      }
    }),
    prisma.room.upsert({
      where: { name: 'Conference Room B' },
      update: {},
      create: {
        name: 'Conference Room B',
        capacity: 8,
        description: 'Medium conference room with video conferencing',
        x: 350,
        y: 100,
        width: 180,
        height: 120,
        isUnderMaintenance: false
      }
    }),
    prisma.room.upsert({
      where: { name: 'Meeting Room 1' },
      update: {},
      create: {
        name: 'Meeting Room 1',
        capacity: 6,
        description: 'Small meeting room for team discussions',
        x: 100,
        y: 300,
        width: 150,
        height: 100,
        isUnderMaintenance: false
      }
    }),
    prisma.room.upsert({
      where: { name: 'Meeting Room 2' },
      update: {},
      create: {
        name: 'Meeting Room 2',
        capacity: 4,
        description: 'Intimate meeting space for small groups',
        x: 300,
        y: 300,
        width: 120,
        height: 100,
        isUnderMaintenance: false
      }
    }),
    prisma.room.upsert({
      where: { name: 'Board Room' },
      update: {},
      create: {
        name: 'Board Room',
        capacity: 20,
        description: 'Executive board room with premium amenities',
        x: 500,
        y: 100,
        width: 250,
        height: 200,
        isUnderMaintenance: false
      }
    }),
    prisma.room.upsert({
      where: { name: 'Training Room' },
      update: {},
      create: {
        name: 'Training Room',
        capacity: 15,
        description: 'Training facility with presentation equipment',
        x: 100,
        y: 500,
        width: 200,
        height: 150,
        isUnderMaintenance: false
      }
    })
  ]);

  console.log(`✅ Created ${rooms.length} rooms`);

  // Create sample bookings
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Check if bookings already exist to avoid duplicates
  const existingBookings = await prisma.booking.findMany();
  
  const bookings: any[] = [];
  if (existingBookings.length === 0) {
    bookings.push(
      await prisma.booking.create({
        data: {
          roomId: rooms[0].id,
          userId: users[2].id, // John Smith
          purpose: 'Weekly team meeting',
          startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
          endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
          status: BookingStatus.APPROVED,
          approvedBy: users[0].id, // Admin
          approvedAt: new Date()
        }
      }),
      await prisma.booking.create({
        data: {
          roomId: rooms[1].id,
          userId: users[3].id, // Sarah Johnson
          purpose: 'Client presentation',
          startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
          endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 30),
          status: BookingStatus.APPROVED,
          approvedBy: users[1].id, // Manager
          approvedAt: new Date()
        }
      }),
      await prisma.booking.create({
        data: {
          roomId: rooms[4].id,
          userId: users[4].id, // Michael Brown
          purpose: 'Board meeting',
          startTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 10, 0),
          endTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 12, 0),
          status: BookingStatus.PENDING
        }
      })
    );
  }

  console.log(`✅ Created ${bookings.length} bookings`);

  console.log('🎉 Database seeded successfully!');
  console.log('📧 Login credentials:');
  console.log('   Super Admin: admin@company.com / password123');
  console.log('   Manager: manager@company.com / password123');
  console.log('   User: john@company.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });