import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function getClient() {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  return global.prisma
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