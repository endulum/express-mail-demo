import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'

import dotenv from 'dotenv'
dotenv.config({ path: '.env.' + process.env.ENV })

const prisma = new PrismaClient({ 
  log: ['query'],
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function clearDatabase() {
  await prisma.user.deleteMany()
  await prisma.session.deleteMany()
}

async function generateAdmin() {
  if (!process.env.ADMINPASS) return;
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(process.env.ADMINPASS, salt)
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      id: 1,
      role: 'ADMIN'
    }
  })
}

async function main() {
  await clearDatabase()
  await generateAdmin()
}

main()
  .catch(e => {
    console.error(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });