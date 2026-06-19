import { PrismaClient } from '@prisma/client' 
 
const globalForPrisma = globalThis as unknown as { 
} 
 
function getClient() { 
  if (!globalForPrisma.prisma) { 
    globalForPrisma.prisma = new PrismaClient() 
  } 
  return globalForPrisma.prisma 
} 
 
export function getPrismaClient() { 
  return getClient() 
} 
 
export const prisma = new Proxy({} as PrismaClient, { 
  get(_, prop: string | symbol) { 
    const client = getClient() 
    const value = client[prop as keyof PrismaClient] 
    if (typeof value === 'function') { 
      return value.bind(client) 
    } 
    return value 
  } 
}) as PrismaClient 
