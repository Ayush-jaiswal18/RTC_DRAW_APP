
import { PrismaClient } from "@prisma/client";

// Construct PrismaClient with options to satisfy Prisma v7 requirement
// (avoids runtime error complaining about missing options)
export const prismaClient = new PrismaClient({});