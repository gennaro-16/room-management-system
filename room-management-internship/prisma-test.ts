import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  console.log(rooms);
}

main().catch(console.error).finally(() => prisma.$disconnect());
