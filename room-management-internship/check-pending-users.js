const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPendingUsers() {
  try {
    console.log('Checking for pending users...');
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isApproved: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`Total users: ${allUsers.length}`);
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Approved: ${user.isApproved}, Role: ${user.role}`);
    });
    
    // Get pending users specifically
    const pendingUsers = await prisma.user.findMany({
      where: {
        isApproved: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isApproved: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`\nPending users (isApproved: false): ${pendingUsers.length}`);
    pendingUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Approved: ${user.isApproved}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingUsers();
