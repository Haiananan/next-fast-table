import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const db = globalThis.prisma || new PrismaClient()
export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db
