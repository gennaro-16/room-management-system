// prisma/seed.ts
import { PrismaClient, Prisma, UserRole, BookingStatus, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Departments
  const departments = await prisma.department.createMany({
    data: [
      {
        name: 'Executive Leadership',
        description: 'Bank executive management and strategic planning',
        floor: 10
      },
      {
        name: 'Commercial Banking',
        description: 'Business banking services and commercial loans',
        floor: 7
      },
      {
        name: 'Retail Banking',
        description: 'Personal banking services and branch operations',
        floor: 3
      },
      {
        name: 'Risk Management',
        description: 'Risk assessment and compliance',
        floor: 8
      },
      {
        name: 'IT Department',
        description: 'Information technology and systems support',
        floor: 9
      }
    ]
  });

  // Get created departments
  const executiveDept = await prisma.department.findFirst({ where: { name: 'Executive Leadership' } });
  const commercialDept = await prisma.department.findFirst({ where: { name: 'Commercial Banking' } });
  const retailDept = await prisma.department.findFirst({ where: { name: 'Retail Banking' } });
  const riskDept = await prisma.department.findFirst({ where: { name: 'Risk Management' } });
  const itDept = await prisma.department.findFirst({ where: { name: 'IT Department' } });

  // Create Users
  const users = await prisma.user.createMany({
    data: [
      // Executive Leadership
      {
        employeeId: 'EXEC001',
        username: 'jdoe',
        email: 'jdoe@bank.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        firstName: 'John',
        lastName: 'Doe',
        title: 'Chief Executive Officer',
        phone: '+1-555-0101',
        departmentId: executiveDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'EXEC002',
        username: 'sjohnson',
        email: 'sjohnson@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'Chief Financial Officer',
        phone: '+1-555-0102',
        departmentId: executiveDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'EXEC003',
        username: 'rwilliams',
        email: 'rwilliams@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'Robert',
        lastName: 'Williams',
        title: 'Chief Operations Officer',
        phone: '+1-555-0103',
        departmentId: executiveDept!.id,
        isApproved: true,
        isActive: true
      },

      // Commercial Banking
      {
        employeeId: 'COMM001',
        username: 'mbrown',
        email: 'mbrown@bank.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        firstName: 'Michael',
        lastName: 'Brown',
        title: 'Director of Commercial Banking',
        phone: '+1-555-0201',
        departmentId: commercialDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'COMM002',
        username: 'ldavis',
        email: 'ldavis@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'Lisa',
        lastName: 'Davis',
        title: 'Senior Commercial Manager',
        phone: '+1-555-0202',
        departmentId: commercialDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'COMM003',
        username: 'jmiller',
        email: 'jmiller@bank.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        firstName: 'James',
        lastName: 'Miller',
        title: 'Commercial Loan Officer',
        phone: '+1-555-0203',
        departmentId: commercialDept!.id,
        isApproved: true,
        isActive: true
      },

      // Retail Banking
      {
        employeeId: 'RET001',
        username: 'pwilson',
        email: 'pwilson@bank.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        firstName: 'Patricia',
        lastName: 'Wilson',
        title: 'Director of Retail Banking',
        phone: '+1-555-0301',
        departmentId: retailDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'RET002',
        username: 'dmoore',
        email: 'dmoore@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'David',
        lastName: 'Moore',
        title: 'Branch Network Manager',
        phone: '+1-555-0302',
        departmentId: retailDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'RET003',
        username: 'jtaylor',
        email: 'jtaylor@bank.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        firstName: 'Jennifer',
        lastName: 'Taylor',
        title: 'Personal Banker',
        phone: '+1-555-0303',
        departmentId: retailDept!.id,
        isApproved: true,
        isActive: true
      },

      // Risk Management
      {
        employeeId: 'RISK001',
        username: 'aanderson',
        email: 'aanderson@bank.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        firstName: 'Andrew',
        lastName: 'Anderson',
        title: 'Chief Risk Officer',
        phone: '+1-555-0401',
        departmentId: riskDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'RISK002',
        username: 'sjackson',
        email: 'sjackson@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'Susan',
        lastName: 'Jackson',
        title: 'Compliance Manager',
        phone: '+1-555-0402',
        departmentId: riskDept!.id,
        isApproved: true,
        isActive: true
      },

      // IT Department
      {
        employeeId: 'IT001',
        username: 'twhite',
        email: 'twhite@bank.com',
        password: hashedPassword,
        role: UserRole.DIRECTOR,
        firstName: 'Thomas',
        lastName: 'White',
        title: 'Chief Information Officer',
        phone: '+1-555-0501',
        departmentId: itDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'IT002',
        username: 'nharris',
        email: 'nharris@bank.com',
        password: hashedPassword,
        role: UserRole.SUB_DIRECTOR,
        firstName: 'Nancy',
        lastName: 'Harris',
        title: 'IT Infrastructure Manager',
        phone: '+1-555-0502',
        departmentId: itDept!.id,
        isApproved: true,
        isActive: true
      },
      {
        employeeId: 'IT003',
        username: 'cmartin',
        email: 'cmartin@bank.com',
        password: hashedPassword,
        role: UserRole.EMPLOYEE,
        firstName: 'Charles',
        lastName: 'Martin',
        title: 'Software Developer',
        phone: '+1-555-0503',
        departmentId: itDept!.id,
        isApproved: true,
        isActive: true
      },

      // Admin user
      {
        employeeId: 'ADM001',
        username: 'admin',
        email: 'admin@bank.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        title: 'System Administrator',
        phone: '+1-555-0000',
        departmentId: executiveDept!.id,
        isApproved: true,
        isActive: true
      }
    ]
  });

  // Get created users for relationships
  const adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  const executives = await prisma.user.findMany({ where: { departmentId: executiveDept!.id } });
  const commercialUsers = await prisma.user.findMany({ where: { departmentId: commercialDept!.id } });
  const retailUsers = await prisma.user.findMany({ where: { departmentId: retailDept!.id } });
  const riskUsers = await prisma.user.findMany({ where: { departmentId: riskDept!.id } });
  const itUsers = await prisma.user.findMany({ where: { departmentId: itDept!.id } });

  // Create Rooms
  const rooms = await prisma.room.createMany({
    data: [
      // Executive Floor Rooms
      {
        name: 'Executive Boardroom',
        capacity: 20,
        description: 'Main boardroom for executive meetings',
        amenities: ['projector', 'video-conference', 'whiteboard', 'teleconference'],
        floor: 10,
        building: 'Main Tower',
        departmentId: executiveDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Executive Conference A',
        capacity: 10,
        description: 'Executive meeting room',
        amenities: ['projector', 'video-conference'],
        floor: 10,
        building: 'Main Tower',
        departmentId: executiveDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Executive Conference B',
        capacity: 8,
        description: 'Small executive meeting room',
        amenities: ['teleconference'],
        floor: 10,
        building: 'Main Tower',
        departmentId: executiveDept!.id,
        isUnderMaintenance: false
      },

      // Commercial Banking Rooms
      {
        name: 'Commercial Conference',
        capacity: 15,
        description: 'Client meeting room for commercial banking',
        amenities: ['projector', 'whiteboard'],
        floor: 7,
        building: 'Main Tower',
        departmentId: commercialDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Deal Room',
        capacity: 6,
        description: 'Private meeting room for deal discussions',
        amenities: ['teleconference'],
        floor: 7,
        building: 'Main Tower',
        departmentId: commercialDept!.id,
        isUnderMaintenance: false
      },

      // Retail Banking Rooms
      {
        name: 'Retail Training',
        capacity: 25,
        description: 'Training room for retail staff',
        amenities: ['projector', 'whiteboard'],
        floor: 3,
        building: 'Main Tower',
        departmentId: retailDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Branch Manager Office',
        capacity: 4,
        description: 'Private office for branch managers',
        amenities: [],
        floor: 3,
        building: 'Main Tower',
        departmentId: retailDept!.id,
        isUnderMaintenance: false
      },

      // Risk Management Rooms
      {
        name: 'Compliance Room',
        capacity: 12,
        description: 'Meeting room for compliance discussions',
        amenities: ['projector', 'whiteboard'],
        floor: 8,
        building: 'Main Tower',
        departmentId: riskDept!.id,
        isUnderMaintenance: false
      },

      // IT Department Rooms
      {
        name: 'IT War Room',
        capacity: 10,
        description: 'Incident response and project planning room',
        amenities: ['projector', 'multiple-screens', 'whiteboard'],
        floor: 9,
        building: 'Main Tower',
        departmentId: itDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Server Room Access',
        capacity: 2,
        description: 'Secure access room to server infrastructure',
        amenities: ['secure-access'],
        floor: 9,
        building: 'Main Tower',
        departmentId: itDept!.id,
        isUnderMaintenance: true,
        maintenanceNotes: 'HVAC upgrade in progress'
      },

      // General Purpose Rooms
      {
        name: 'Main Auditorium',
        capacity: 100,
        description: 'Large auditorium for all-hands meetings',
        amenities: ['projector', 'stage', 'sound-system'],
        floor: 1,
        building: 'Main Tower',
        departmentId: executiveDept!.id,
        isUnderMaintenance: false
      },
      {
        name: 'Training Room 1',
        capacity: 30,
        description: 'General purpose training room',
        amenities: ['projector', 'whiteboard'],
        floor: 2,
        building: 'Main Tower',
        departmentId: retailDept!.id,
        isUnderMaintenance: false
      }
    ]
  });

  // Get created rooms
  const executiveBoardroom = await prisma.room.findFirst({ where: { name: 'Executive Boardroom' } });
  const commercialConference = await prisma.room.findFirst({ where: { name: 'Commercial Conference' } });
  const retailTraining = await prisma.room.findFirst({ where: { name: 'Retail Training' } });
  const complianceRoom = await prisma.room.findFirst({ where: { name: 'Compliance Room' } });
  const itWarRoom = await prisma.room.findFirst({ where: { name: 'IT War Room' } });
  const mainAuditorium = await prisma.room.findFirst({ where: { name: 'Main Auditorium' } });

  // Create Bookings
  const executiveDirector = executives.find(u => u.role === UserRole.DIRECTOR);
  const commercialDirector = commercialUsers.find(u => u.role === UserRole.DIRECTOR);
  const retailDirector = retailUsers.find(u => u.role === UserRole.DIRECTOR);
  const riskDirector = riskUsers.find(u => u.role === UserRole.DIRECTOR);
  const itDirector = itUsers.find(u => u.role === UserRole.DIRECTOR);

  // Create some bookings (only when all required references exist)
  const bookingsData: any[] = [];
  if (executiveBoardroom?.id && executiveDirector?.id && adminUser?.id) {
    bookingsData.push({
      title: 'Quarterly Strategy Meeting',
      roomId: executiveBoardroom.id,
      organizerId: executiveDirector.id,
      expectedAttendees: 15,
      purpose: 'Review Q3 performance and plan Q4 strategy',
      agenda: 'Financial review, Market analysis, Strategic initiatives',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      status: BookingStatus.APPROVED,
      isRecurring: false,
      requiredAmenities: ['projector', 'video-conference'],
      approvedById: adminUser.id,
      approvedAt: new Date(),
    });
  }
  if (commercialConference?.id && commercialDirector?.id && adminUser?.id) {
    bookingsData.push({
      title: 'Client Presentation - ABC Corp',
      roomId: commercialConference.id,
      organizerId: commercialDirector.id,
      expectedAttendees: 8,
      purpose: 'Present commercial lending options to ABC Corporation',
      agenda: 'Company overview, Financial products, Q&A session',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: BookingStatus.APPROVED,
      isRecurring: false,
      requiredAmenities: ['projector'],
      approvedById: adminUser.id,
      approvedAt: new Date(),
    });
  }
  if (retailTraining?.id && retailDirector?.id) {
    bookingsData.push({
      title: 'Staff Training: New Compliance Regulations',
      roomId: retailTraining.id,
      organizerId: retailDirector.id,
      expectedAttendees: 20,
      purpose: 'Train retail staff on new banking regulations',
      agenda: 'Regulation overview, Implementation timeline, Q&A',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      status: BookingStatus.PENDING,
      isRecurring: false,
      requiredAmenities: ['projector'],
    });
  }
  if (complianceRoom?.id && riskDirector?.id && adminUser?.id) {
    bookingsData.push({
      title: 'Compliance Committee Meeting',
      roomId: complianceRoom.id,
      organizerId: riskDirector.id,
      expectedAttendees: 10,
      purpose: 'Monthly compliance committee review',
      agenda: 'Risk assessment updates, Regulatory changes, Action items',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      status: BookingStatus.APPROVED,
      isRecurring: true,
      recurrenceRule: 'RRULE:FREQ=MONTHLY;INTERVAL=1',
      requiredAmenities: ['projector'],
      approvedById: adminUser.id,
      approvedAt: new Date(),
    });
  }
  if (itWarRoom?.id && itDirector?.id && adminUser?.id) {
    bookingsData.push({
      title: 'System Migration Planning',
      roomId: itWarRoom.id,
      organizerId: itDirector.id,
      expectedAttendees: 8,
      purpose: 'Plan upcoming core banking system migration',
      agenda: 'Timeline review, Risk assessment, Resource allocation',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      status: BookingStatus.APPROVED,
      isRecurring: false,
      requiredAmenities: ['multiple-screens', 'whiteboard'],
      approvedById: adminUser.id,
      approvedAt: new Date(),
    });
  }
  if (bookingsData.length) {
    await prisma.booking.createMany({ data: bookingsData });
  }

  // Get created bookings
  const createdBookings = await prisma.booking.findMany();

  // Create notifications
  const notificationsData: any[] = [];
  if (createdBookings[0]?.id && executiveDirector?.id) {
    notificationsData.push({
      userId: executiveDirector.id,
      title: 'Booking Approved',
      message: 'Your Quarterly Strategy Meeting booking has been approved',
      type: NotificationType.BOOKING_APPROVED,
      relatedBookingId: createdBookings[0].id,
      isRead: true,
    });
  }
  if (createdBookings[1]?.id && commercialDirector?.id) {
    notificationsData.push({
      userId: commercialDirector.id,
      title: 'Booking Approved',
      message: 'Your Client Presentation booking has been approved',
      type: NotificationType.BOOKING_APPROVED,
      relatedBookingId: createdBookings[1].id,
      isRead: true,
    });
  }
  if (createdBookings[2]?.id && retailDirector?.id) {
    notificationsData.push({
      userId: retailDirector.id,
      title: 'Booking Request Received',
      message: 'Your training session booking is pending approval',
      type: NotificationType.NEW_BOOKING_REQUEST,
      relatedBookingId: createdBookings[2].id,
      isRead: false,
    });
  }
  if (createdBookings[2]?.id && adminUser?.id) {
    notificationsData.push({
      userId: adminUser.id,
      title: 'New Booking Request',
      message: 'A new booking requires your approval',
      type: NotificationType.NEW_BOOKING_REQUEST,
      relatedBookingId: createdBookings[2].id,
      isRead: false,
    });
  }
  if (notificationsData.length) {
    await prisma.notification.createMany({ data: notificationsData });
  }

  console.log('Seed completed successfully!');
  console.log(`Created: ${(await prisma.department.count())} departments`);
  console.log(`Created: ${(await prisma.user.count())} users`);
  console.log(`Created: ${(await prisma.room.count())} rooms`);
  console.log(`Created: ${(await prisma.booking.count())} bookings`);
  console.log(`Created: ${(await prisma.notification.count())} notifications`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });